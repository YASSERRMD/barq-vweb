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
