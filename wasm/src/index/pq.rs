use serde::{Serialize, Deserialize};
use crate::compute;

const DEFAULT_M: usize = 8;
const DEFAULT_K: usize = 256;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PqCompressor {
    pub m: usize,          // number of subspaces
    pub k: usize,          // centroids per subspace
    pub d: usize,          // full vector dimension
    pub sub_d: usize,      // dimension per subspace
    pub centroids: Vec<Vec<Vec<f32>>>, // [m][k][sub_d]
}

impl PqCompressor {
    pub fn new(d: usize) -> Self {
        let m = DEFAULT_M;
        let k = DEFAULT_K;
        let sub_d = (d + m - 1) / m;
        Self { m, k, d, sub_d, centroids: Vec::new() }
    }

    pub fn train(&mut self, corpus: &[Vec<f32>]) {
        if corpus.is_empty() { return; }
        self.centroids = Vec::with_capacity(self.m);
        for sub in 0..self.m {
            let start = sub * self.sub_d;
            let end = ((sub + 1) * self.sub_d).min(self.d);
            let subvecs: Vec<Vec<f32>> = corpus.iter()
                .map(|v| v[start..end.min(v.len())].to_vec())
                .collect();
            let ks = self.k.min(subvecs.len());
            let centroids = kmeans(&subvecs, ks, 10);
            self.centroids.push(centroids);
        }
    }

    pub fn encode(&self, v: &[f32]) -> Vec<u8> {
        if self.centroids.is_empty() { return vec![0u8; self.m]; }
        let mut code = Vec::with_capacity(self.m);
        for sub in 0..self.m {
            let start = sub * self.sub_d;
            let end = ((sub + 1) * self.sub_d).min(self.d).min(v.len());
            let subv = &v[start..end];
            let best = self.centroids[sub].iter().enumerate()
                .min_by(|(_, a), (_, b)| {
                    let da = l2sq(subv, &a[..end-start]);
                    let db = l2sq(subv, &b[..end-start]);
                    da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
                })
                .map(|(i, _)| i)
                .unwrap_or(0);
            code.push(best as u8);
        }
        code
    }

    pub fn decode(&self, code: &[u8]) -> Vec<f32> {
        if self.centroids.is_empty() { return vec![0.0; self.d]; }
        let mut out = Vec::with_capacity(self.d);
        for (sub, &c) in code.iter().enumerate().take(self.m) {
            let centroid = &self.centroids[sub][c as usize % self.k];
            out.extend_from_slice(centroid);
        }
        out.truncate(self.d);
        out
    }

    pub fn asymmetric_distance(&self, query: &[f32], code: &[u8]) -> f32 {
        if self.centroids.is_empty() { return 1.0; }
        let approx = self.decode(code);
        1.0 - compute::cosine_sim(query, &approx)
    }

    pub fn serialize(&self) -> Vec<u8> {
        serde_json::to_vec(self).unwrap_or_default()
    }

    pub fn deserialize(data: &[u8]) -> Option<Self> {
        serde_json::from_slice(data).ok()
    }
}

fn l2sq(a: &[f32], b: &[f32]) -> f32 {
    a.iter().zip(b.iter()).map(|(x, y)| (x - y).powi(2)).sum()
}

fn kmeans(data: &[Vec<f32>], k: usize, iters: usize) -> Vec<Vec<f32>> {
    if data.is_empty() || k == 0 { return vec![]; }
    let d = data[0].len();
    // Initialize with first k items as centroids
    let mut centroids: Vec<Vec<f32>> = data[..k.min(data.len())].to_vec();
    let mut assignments = vec![0usize; data.len()];

    for _ in 0..iters {
        // Assign
        for (i, v) in data.iter().enumerate() {
            let best = centroids.iter().enumerate()
                .min_by(|(_, a), (_, b)| {
                    let da = l2sq(v, a);
                    let db = l2sq(v, b);
                    da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
                })
                .map(|(idx, _)| idx)
                .unwrap_or(0);
            assignments[i] = best;
        }
        // Update centroids
        let mut sums = vec![vec![0.0f32; d]; k];
        let mut counts = vec![0usize; k];
        for (i, v) in data.iter().enumerate() {
            let c = assignments[i];
            for (j, x) in v.iter().enumerate() {
                if j < d { sums[c][j] += x; }
            }
            counts[c] += 1;
        }
        for c in 0..k {
            if counts[c] > 0 {
                for j in 0..d {
                    centroids[c][j] = sums[c][j] / counts[c] as f32;
                }
            }
        }
    }
    centroids
}
