#![cfg(target_arch = "wasm32")]

use wasm_bindgen_test::*;
use barq_vweb::compute;



#[wasm_bindgen_test]
fn test_compute_bridge() {
    let q = vec![1.0, 0.0, 0.0];
    let c = vec![0.0, 1.0, 0.0];
    let sim = compute::cosine_sim(&q, &c);
    assert!(sim.abs() < 1e-6);

    let q2 = vec![1.0, 1.0, 1.0];
    let c2 = vec![1.0, 1.0, 1.0];
    let sim2 = compute::cosine_sim(&q2, &c2);
    assert!((sim2 - 1.0).abs() < 1e-6);
}

#[wasm_bindgen_test]
async fn test_compute_dispatch() {
    let backend = compute::probe_backend().await;
    // Should fallback successfully and not panic
    assert!(matches!(backend, compute::Backend::Scalar | compute::Backend::WebGPU | compute::Backend::WebNN | compute::Backend::BarqWasm));
}
