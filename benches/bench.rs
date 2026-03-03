// Note: criterion doesn't work for wasm32; this file provides benchmark stubs
// that can be run natively. WASM-target benchmarks are done via wasm-pack test timing.

// To run native benchmarks (uses scalar paths):
//   cargo bench --target x86_64-apple-darwin (or your native target)

fn main() {
    let dim = 64usize;
    let n = 1000usize;

    // Bench: single vector insert
    let mut index = simple_hnsw_bench(dim);
    let t0 = std::time::Instant::now();
    let v = vec![0.5f32; dim];
    index.push(v.clone());
    println!("single insert: {:?}", t0.elapsed());

    // Bench: batch 1000 inserts
    let t1 = std::time::Instant::now();
    for i in 0..n {
        let v: Vec<f32> = (0..dim).map(|j| ((i * dim + j) as f32).sin()).collect();
        index.push(v);
    }
    println!("batch insert 1000: {:?}", t1.elapsed());

    // Bench: knn search
    let query = vec![0.1f32; dim];
    let t2 = std::time::Instant::now();
    let _ = linear_knn(&index, &query, 5);
    println!("knn linear scan 1001 vecs: {:?}", t2.elapsed());

    // Embed bench approximation (no ORT, just tokenization timing)
    let texts = vec!["the quick brown fox"; 100];
    let t3 = std::time::Instant::now();
    for text in &texts {
        let _ = stub_embed(text, dim);
    }
    println!("embed batch 100 (stub): {:?}", t3.elapsed());
}

fn simple_hnsw_bench(dim: usize) -> Vec<Vec<f32>> { vec![] }

fn linear_knn(corpus: &[Vec<f32>], query: &[f32], k: usize) -> Vec<(usize, f32)> {
    let mut scores: Vec<(usize, f32)> = corpus.iter().enumerate().map(|(i, v)| {
        let dot: f32 = v.iter().zip(query).map(|(a, b)| a * b).sum();
        let an: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
        let bn: f32 = query.iter().map(|x| x * x).sum::<f32>().sqrt();
        let sim = if an * bn > 1e-9 { dot / (an * bn) } else { 0.0 };
        (i, sim)
    }).collect();
    scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    scores.truncate(k);
    scores
}

fn stub_embed(text: &str, dim: usize) -> Vec<f32> {
    let mut v = vec![0.0f32; dim];
    for (i, b) in text.bytes().enumerate() {
        v[i % dim] += b as f32 / 255.0;
    }
    let norm: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm > 1e-9 { for x in &mut v { *x /= norm; } }
    v
}
