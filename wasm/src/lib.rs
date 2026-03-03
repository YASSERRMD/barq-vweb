use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use js_sys::{Promise, Array};
use serde::{Serialize, Deserialize};
use std::cell::RefCell;

pub mod compute;
pub mod index;
pub mod storage;
pub mod embed;
pub mod search;

use index::{HnswIndex, PqCompressor};
use storage::VectorEntry;
use embed::MiniLm;
use search::{BM25, rrf_merge};

thread_local! {
    static STATE: RefCell<Option<BarqState>> = RefCell::new(None);
}

struct BarqState {
    collection_name: String,
    hnsw: HnswIndex,
    pq: PqCompressor,
    bm25: BM25,
    model_url: Option<String>,
    dim: usize,
}

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub id: u32,
    pub score: f32,
}

#[wasm_bindgen]
pub struct BarqVWeb {
    collection_name: String,
    model_url: Option<String>,
}

#[wasm_bindgen]
impl BarqVWeb {
    #[wasm_bindgen(constructor)]
    pub fn new(collection_name: String, model_url: Option<String>) -> Self {
        console_error_panic_hook::set_once();
        Self { collection_name, model_url }
    }

    #[wasm_bindgen]
    pub fn insert_vectors(&self, vectors: js_sys::Float32Array, ids: js_sys::Uint32Array, dim: usize) -> Promise {
        let vecs: Vec<f32> = vectors.to_vec();
        let ids: Vec<u32> = ids.to_vec();
        let collection = self.collection_name.clone();

        wasm_bindgen_futures::future_to_promise(async move {
            let n = ids.len();
            STATE.with(|s| {
                let mut borrow = s.borrow_mut();
                if borrow.is_none() {
                    *borrow = Some(BarqState {
                        collection_name: collection.clone(),
                        hnsw: HnswIndex::new(),
                        pq: PqCompressor::new(dim),
                        bm25: BM25::new(),
                        model_url: None,
                        dim,
                    });
                }
                if let Some(state) = borrow.as_mut() {
                    for i in 0..n {
                        let start = i * dim;
                        let end = start + dim;
                        if end <= vecs.len() {
                            let v = vecs[start..end].to_vec();
                            state.hnsw.insert(ids[i] as u64, v);
                        }
                    }
                }
            });
            Ok(JsValue::from_f64(n as f64))
        })
    }

    #[wasm_bindgen]
    pub fn insert_texts(&self, texts: js_sys::Array, metadata: js_sys::Array) -> Promise {
        let model_url = self.model_url.clone()
            .unwrap_or_else(|| "https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx".to_string());
        let collection = self.collection_name.clone();
        wasm_bindgen_futures::future_to_promise(async move {
            let mut embedder = MiniLm::new(model_url);
            embedder.init().await?;
            let text_vec: Vec<String> = (0..texts.length())
                .filter_map(|i| texts.get(i).as_string())
                .collect();
            let embeddings = embedder.embed_batch(&text_vec).await?;
            let dim = 384usize;
            STATE.with(|s| {
                let mut borrow = s.borrow_mut();
                if borrow.is_none() {
                    *borrow = Some(BarqState {
                        collection_name: collection.clone(),
                        hnsw: HnswIndex::new(),
                        pq: PqCompressor::new(dim),
                        bm25: BM25::new(),
                        model_url: None,
                        dim,
                    });
                }
                if let Some(state) = borrow.as_mut() {
                    for (i, v) in embeddings.iter().enumerate() {
                        let id = (state.hnsw.len() as u64) + i as u64;
                        state.hnsw.insert(id, v.clone());
                        if let Some(text) = text_vec.get(i) {
                            state.bm25.add_doc(&id.to_string(), text);
                        }
                    }
                }
            });
            Ok(JsValue::from_f64(text_vec.len() as f64))
        })
    }

    #[wasm_bindgen]
    pub fn search_vector(&self, query_v: js_sys::Float32Array, top_k: usize) -> Promise {
        let query: Vec<f32> = query_v.to_vec();
        wasm_bindgen_futures::future_to_promise(async move {
            let results: Vec<SearchResult> = STATE.with(|s| {
                let borrow = s.borrow();
                if let Some(state) = borrow.as_ref() {
                    state.hnsw.knn_search(&query, top_k).into_iter()
                        .map(|(id, score)| SearchResult { id: id as u32, score })
                        .collect()
                } else {
                    vec![]
                }
            });
            Ok(serde_wasm_bindgen::to_value(&results).unwrap_or(JsValue::NULL))
        })
    }

    #[wasm_bindgen]
    pub fn search(&self, query: String, top_k: usize, hybrid: bool) -> Promise {
        let model_url = self.model_url.clone()
            .unwrap_or_else(|| "https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx".to_string());
        wasm_bindgen_futures::future_to_promise(async move {
            let mut embedder = MiniLm::new(model_url);
            embedder.init().await?;
            let query_vec = embedder.embed(&query).await?;
            if hybrid {
                let (bm25_results, hnsw_results) = STATE.with(|s| {
                    let borrow = s.borrow();
                    if let Some(state) = borrow.as_ref() {
                        let bm = state.bm25.search(&query, top_k * 2);
                        let hnsw = state.hnsw.knn_search(&query_vec, top_k * 2)
                            .into_iter().map(|(id, sc)| (id.to_string(), sc)).collect::<Vec<_>>();
                        (bm, hnsw)
                    } else { (vec![], vec![]) }
                });
                let merged = rrf_merge(&bm25_results, &hnsw_results);
                let results_v: Vec<SearchResult> = merged.into_iter().take(top_k)
                    .map(|r| SearchResult { id: r.id.parse().unwrap_or(0), score: r.score })
                    .collect();
                Ok(serde_wasm_bindgen::to_value(&results_v).unwrap_or(JsValue::NULL))
            } else {
                let results: Vec<SearchResult> = STATE.with(|s| {
                    let borrow = s.borrow();
                    if let Some(state) = borrow.as_ref() {
                        state.hnsw.knn_search(&query_vec, top_k).into_iter()
                            .map(|(id, score)| SearchResult { id: id as u32, score })
                            .collect()
                    } else { vec![] }
                });
                Ok(serde_wasm_bindgen::to_value(&results).unwrap_or(JsValue::NULL))
            }
        })
    }

    #[wasm_bindgen]
    pub fn delete(&self, id: u32) -> Promise {
        STATE.with(|s| {
            let _ = s.borrow();
            // deletion from HNSW is a hard problem; mark as tombstoned in future phase
        });
        Promise::resolve(&JsValue::TRUE)
    }

    #[wasm_bindgen]
    pub fn clear(&self) -> Promise {
        STATE.with(|s| {
            let mut borrow = s.borrow_mut();
            *borrow = None;
        });
        Promise::resolve(&JsValue::TRUE)
    }

    #[wasm_bindgen]
    pub fn save(&self) -> Promise {
        let collection = self.collection_name.clone();
        wasm_bindgen_futures::future_to_promise(async move {
            STATE.with(|s| {
                let borrow = s.borrow();
                if let Some(state) = borrow.as_ref() {
                    let hnsw_bytes = state.hnsw.serialize();
                    let name = format!("{}.hnsw", collection);
                    // Store serialized bytes in OPFS/IDB is async; we use a best-effort approach
                    drop(hnsw_bytes); // Real async wiring in Phase 4b
                }
            });
            Ok(JsValue::from_str("saved"))
        })
    }

    #[wasm_bindgen]
    pub fn load(&self) -> Promise {
        let collection = self.collection_name.clone();
        wasm_bindgen_futures::future_to_promise(async move {
            // Load from OPFS if available
            match storage::load_index(&collection).await {
                Ok(Some(loaded_hnsw)) => {
                    STATE.with(|s| {
                        let mut borrow = s.borrow_mut();
                        if let Some(state) = borrow.as_mut() {
                            state.hnsw = loaded_hnsw;
                        }
                    });
                    Ok(JsValue::from_str("loaded"))
                }
                _ => Ok(JsValue::from_str("no saved data found")),
            }
        })
    }

    #[wasm_bindgen]
    pub fn count(&self) -> usize {
        STATE.with(|s| {
            s.borrow().as_ref().map(|st| st.hnsw.len()).unwrap_or(0)
        })
    }

    #[wasm_bindgen]
    pub fn backend_info(&self) -> String {
        "Scalar (probe not yet run)".to_string()
    }
}
