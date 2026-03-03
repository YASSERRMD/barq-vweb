use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use js_sys::{Promise, Array};
use serde::{Serialize, Deserialize};
use std::cell::RefCell;

pub mod compute;
pub mod index;

use index::{HnswIndex, PqCompressor};

thread_local! {
    static STATE: RefCell<Option<BarqState>> = RefCell::new(None);
}

struct BarqState {
    collection_name: String,
    hnsw: HnswIndex,
    pq: PqCompressor,
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
    pub fn insert_texts(&self, texts: js_sys::Array, _metadata: js_sys::Array) -> Promise {
        Promise::resolve(&JsValue::from_str("texts not yet supported without embedder"))
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
    pub fn search(&self, _query: String, top_k: usize, _hybrid: bool) -> Promise {
        Promise::resolve(&JsValue::from_str("text search requires embedder (Phase 5)"))
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
            // Phase 4 will wire storage here
            Ok(JsValue::from_str("save: storage not yet wired (Phase 4)"))
        })
    }

    #[wasm_bindgen]
    pub fn load(&self) -> Promise {
        wasm_bindgen_futures::future_to_promise(async move {
            Ok(JsValue::from_str("load: storage not yet wired (Phase 4)"))
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
