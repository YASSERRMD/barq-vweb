#![cfg(target_arch = "wasm32")]

use wasm_bindgen_test::*;
use barq_vweb::compute;
use barq_vweb::index::{HnswIndex, PqCompressor};

// Phase 2: Compute
#[wasm_bindgen_test]
fn test_compute_bridge_orthogonal() {
    let q = vec![1.0, 0.0, 0.0];
    let c = vec![0.0, 1.0, 0.0];
    let sim = compute::cosine_sim(&q, &c);
    assert!(sim.abs() < 1e-6, "Orthogonal vectors must have ~0 cosine sim");
}

#[wasm_bindgen_test]
fn test_compute_bridge_identical() {
    let q = vec![1.0, 1.0, 1.0];
    let c = vec![1.0, 1.0, 1.0];
    let sim = compute::cosine_sim(&q, &c);
    assert!((sim - 1.0).abs() < 1e-6, "Identical vectors must have cosine sim ~1");
}

#[wasm_bindgen_test]
async fn test_compute_dispatch() {
    let backend = compute::probe_backend().await;
    assert!(
        matches!(backend, compute::Backend::Scalar | compute::Backend::WebGPU | compute::Backend::WebNN | compute::Backend::BarqWasm),
        "probe_backend must return a valid backend"
    );
}

// Phase 3: Indexing
#[wasm_bindgen_test]
fn test_hnsw_insert_and_search() {
    let dim = 8;
    let mut index = HnswIndex::new();
    let n = 100usize;

    // Insert 100 random-ish vectors
    for i in 0..n {
        let v: Vec<f32> = (0..dim).map(|j| ((i * dim + j) as f32).sin()).collect();
        index.insert(i as u64, v);
    }
    assert_eq!(index.len(), n);

    // Search for vector 0 — it should be in top results
    let query: Vec<f32> = (0..dim).map(|j| (j as f32).sin()).collect();
    let results = index.knn_search(&query, 5);
    assert!(!results.is_empty(), "knn_search must return results");
    assert_eq!(results[0].0, 0, "Nearest neighbor of v[0] must be v[0]");
}

#[wasm_bindgen_test]
fn test_hnsw_recall_1000() {
    let dim = 8;
    let mut index = HnswIndex::new();
    let n = 200usize; // keep it light for WASM test env

    let vectors: Vec<Vec<f32>> = (0..n)
        .map(|i| (0..dim).map(|j| ((i * 7 + j * 3) as f32 / 100.0).sin()).collect())
        .collect();

    for (i, v) in vectors.iter().enumerate() {
        index.insert(i as u64, v.clone());
    }

    let mut hits = 0;
    let sample = 20;
    for i in 0..sample {
        let query = &vectors[i];
        let results = index.knn_search(query, 1);
        if !results.is_empty() && results[0].0 == i as u64 {
            hits += 1;
        }
    }
    let recall = hits as f32 / sample as f32;
    assert!(recall > 0.9, "Recall must be > 0.9, got {}", recall);
}

#[wasm_bindgen_test]
fn test_hnsw_serialize_roundtrip() {
    let mut index = HnswIndex::new();
    index.insert(1, vec![1.0, 0.0, 0.0]);
    index.insert(2, vec![0.0, 1.0, 0.0]);
    let bytes = index.serialize();
    assert!(!bytes.is_empty());
    let restored = HnswIndex::deserialize(&bytes).expect("deserialize failed");
    assert_eq!(restored.len(), 2);
}

#[wasm_bindgen_test]
fn test_pq_encode_decode() {
    let dim = 8;
    let corpus: Vec<Vec<f32>> = (0..32)
        .map(|i| (0..dim).map(|j| (i * j) as f32 / 32.0).collect())
        .collect();
    let mut pq = PqCompressor::new(dim);
    pq.train(&corpus);
    let v = corpus[0].clone();
    let code = pq.encode(&v);
    assert_eq!(code.len(), pq.m);
    let decoded = pq.decode(&code);
    assert_eq!(decoded.len(), dim);
}

// Phase 5: Embedding
#[wasm_bindgen_test]
async fn test_embed_produces_384_dim() {
    use barq_vweb::embed::MiniLm;
    let mut embedder = MiniLm::new("stub://".to_string());
    embedder.init().await.unwrap();
    let v = embedder.embed("hello world").await.unwrap();
    assert_eq!(v.len(), 384, "MiniLm must produce 384-dim vectors");
    let norm: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
    assert!((norm - 1.0).abs() < 1e-5, "Embedding must be L2-normalized");
}

#[wasm_bindgen_test]
async fn test_embed_batch() {
    use barq_vweb::embed::MiniLm;
    let mut embedder = MiniLm::new("stub://".to_string());
    embedder.init().await.unwrap();
    let texts = vec!["hello".to_string(), "world".to_string(), "rust".to_string()];
    let vecs = embedder.embed_batch(&texts).await.unwrap();
    assert_eq!(vecs.len(), 3);
    for v in &vecs {
        assert_eq!(v.len(), 384);
    }
}

// Phase 6: BM25 and hybrid search
#[wasm_bindgen_test]
fn test_bm25_search() {
    use barq_vweb::search::BM25;
    let mut bm25 = BM25::new();
    bm25.add_doc("0", "rust is a systems programming language");
    bm25.add_doc("1", "python is great for data science");
    bm25.add_doc("2", "rust wasm is fast and safe");
    let results = bm25.search("rust", 2);
    assert!(!results.is_empty(), "BM25 must return results");
    assert!(results[0].0 == "0" || results[0].0 == "2", "rust docs must score highest");
}

#[wasm_bindgen_test]
fn test_rrf_merge() {
    use barq_vweb::search::rrf_merge;
    let bm25: Vec<(String, f32)> = vec![
        ("a".to_string(), 1.5), ("b".to_string(), 1.0)
    ];
    let cosine: Vec<(String, f32)> = vec![
        ("b".to_string(), 0.9), ("c".to_string(), 0.8)
    ];
    let merged = rrf_merge(&bm25, &cosine);
    assert!(!merged.is_empty());
    // "b" appears in both -> should score higher than "c"
    let b_score = merged.iter().find(|r| r.id == "b").map(|r| r.score).unwrap_or(0.0);
    let c_score = merged.iter().find(|r| r.id == "c").map(|r| r.score).unwrap_or(0.0);
    assert!(b_score > c_score, "Shared doc must score higher via RRF");
}
