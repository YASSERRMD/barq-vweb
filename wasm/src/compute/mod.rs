pub mod bridge;
pub mod dispatch;
pub mod gpu;

pub use bridge::*;
pub use dispatch::*;
pub use gpu::*;

use std::rc::Rc;
use std::cell::RefCell;

// Example facade routing
pub fn compute_cosine(a: &[f32], b: &[f32], backend: Backend) -> f32 {
    bridge::cosine_sim(a, b)
}

pub fn compute_batch_cosine(query: &[f32], corpus: &[f32], n: usize, d: usize, backend: Backend) -> Vec<f32> {
    bridge::batch_cosine(query, corpus, n, d)
}

pub fn compute_matmul(a: &[f32], b: &[f32], m: usize, n: usize, k: usize, backend: Backend) -> Vec<f32> {
    bridge::matmul(a, b, m, n, k)
}
