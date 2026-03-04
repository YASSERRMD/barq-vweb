use std::collections::{BinaryHeap, HashMap, HashSet};
use std::cmp::Ordering;
use serde::{Serialize, Deserialize};
use crate::compute;

const M: usize = 16;
const EF_CONSTRUCTION: usize = 200;

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Node {
    id: u64,
    vector: Vec<f32>,
    layers: Vec<Vec<usize>>, // neighbors per layer
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HnswIndex {
    nodes: Vec<Node>,
    id_to_idx: HashMap<u64, usize>,
    entry_point: Option<usize>,
    max_layer: usize,
    ml: f64, // level factor = 1/ln(M)
}

#[derive(PartialEq)]
struct HeapItem {
    score: f32,
    idx: usize,
}

impl Eq for HeapItem {}

impl PartialOrd for HeapItem {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.score.partial_cmp(&other.score)
    }
}

impl Ord for HeapItem {
    fn cmp(&self, other: &Self) -> Ordering {
        // max heap by default
        self.score.partial_cmp(&other.score).unwrap_or(Ordering::Equal)
    }
}

impl HnswIndex {
    pub fn new() -> Self {
        let ml = 1.0 / (M as f64).ln();
        Self {
            nodes: Vec::new(),
            id_to_idx: HashMap::new(),
            entry_point: None,
            max_layer: 0,
            ml,
        }
    }

    fn random_level(&self) -> usize {
        let mut buf = [0u8; 8];
        getrandom::getrandom(&mut buf).expect("getrandom failed");
        let r = u64::from_le_bytes(buf) as f64 / u64::MAX as f64;
        (-r.ln() * self.ml).floor() as usize
    }

    fn distance(&self, a: &[f32], b: &[f32]) -> f32 {
        1.0 - compute::cosine_sim(a, b)
    }

    pub fn len(&self) -> usize {
        self.nodes.len()
    }

    pub fn insert(&mut self, id: u64, vector: Vec<f32>) {
        if self.id_to_idx.contains_key(&id) {
            return; 
        }

        let level = self.random_level();
        let new_idx = self.nodes.len();
        let mut new_node = Node {
            id,
            vector,
            layers: vec![Vec::new(); level + 1],
        };

        let ep = match self.entry_point {
            None => {
                self.nodes.push(new_node);
                self.id_to_idx.insert(id, new_idx);
                self.entry_point = Some(new_idx);
                self.max_layer = level;
                return;
            }
            Some(ep) => ep,
        };

        let q_vec = new_node.vector.clone();
        let mut current_ep = ep;
        // Phase 1: greedy walk to get close entry point for the new node's level
        for l in (level + 1..=self.max_layer).rev() {
            let candidates = self.search_layer(&q_vec, current_ep, 1, l);
            if let Some(best) = candidates.first() {
                current_ep = *best;
            }
        }

        // Phase 2: insert into layers 0..=min(level, max_layer)
        for l in (0..=level.min(self.max_layer)).rev() {
            let candidates = self.search_layer(&q_vec, current_ep, EF_CONSTRUCTION, l);
            let neighbors = self.select_neighbors(&q_vec, &candidates, M, l);
            new_node.layers[l] = neighbors.clone();
            self.nodes.push(new_node.clone());
            let new_idx2 = self.nodes.len() - 1;
            self.id_to_idx.insert(id, new_idx2);
            // Add back-links (with shrinking if needed)
            for &n_idx in &neighbors {
                if n_idx < self.nodes.len() && n_idx != new_idx2 {
                    let n_level = self.nodes[n_idx].layers.len() - 1;
                    if l <= n_level {
                        self.nodes[n_idx].layers[l].push(new_idx2);
                        if self.nodes[n_idx].layers[l].len() > 2 * M {
                            let n_vec = self.nodes[n_idx].vector.clone();
                            let to_trim = self.nodes[n_idx].layers[l].clone();
                            let trimmed = self.select_neighbors(&n_vec, &to_trim, M, l);
                            self.nodes[n_idx].layers[l] = trimmed;
                        }
                    }
                }
            }
            if let Some(best) = candidates.first() {
                current_ep = *best;
            }
            // Clear the duplicate push; revert to clean state
            self.nodes.pop();
        }

        // Now do the real push
        self.nodes.push(new_node);
        let final_idx = self.nodes.len() - 1;
        *self.id_to_idx.get_mut(&id).unwrap() = final_idx;

        // Re-add layers links (simplified)
        for l in 0..=level.min(self.max_layer) {
            let neighbors = self.nodes[final_idx].layers[l].clone();
            for &n_idx in &neighbors {
                if n_idx < self.nodes.len() && n_idx != final_idx {
                    let n_level = self.nodes[n_idx].layers.len() - 1;
                    if l <= n_level {
                        if !self.nodes[n_idx].layers[l].contains(&final_idx) {
                            self.nodes[n_idx].layers[l].push(final_idx);
                            if self.nodes[n_idx].layers[l].len() > 2 * M {
                                let n_vec = self.nodes[n_idx].vector.clone();
                                let to_trim = self.nodes[n_idx].layers[l].clone();
                                let trimmed = self.select_neighbors(&n_vec, &to_trim, M, l);
                                self.nodes[n_idx].layers[l] = trimmed;
                            }
                        }
                    }
                }
            }
        }

        if level > self.max_layer {
            self.max_layer = level;
            self.entry_point = Some(final_idx);
        }
    }

    fn search_layer(&self, query: &[f32], ep: usize, ef: usize, layer: usize) -> Vec<usize> {
        let mut visited = HashSet::new();
        visited.insert(ep);

        let d_ep = self.distance(query, &self.nodes[ep].vector);
        let mut candidates: BinaryHeap<HeapItem> = BinaryHeap::new();
        let mut result: BinaryHeap<HeapItem> = BinaryHeap::new();

        candidates.push(HeapItem { score: -d_ep, idx: ep });
        result.push(HeapItem { score: d_ep, idx: ep });

        while let Some(HeapItem { score: neg_d, idx }) = candidates.pop() {
            let d = -neg_d;
            if let Some(worst) = result.peek() {
                if d > worst.score { break; }
            }
            let neighbors = if layer < self.nodes[idx].layers.len() {
                self.nodes[idx].layers[layer].clone()
            } else {
                vec![]
            };
            for n_idx in neighbors {
                if !visited.contains(&n_idx) && n_idx < self.nodes.len() {
                    visited.insert(n_idx);
                    let d_n = self.distance(query, &self.nodes[n_idx].vector);
                    let worst = result.peek().map(|h| h.score).unwrap_or(f32::MAX);
                    if d_n < worst || result.len() < ef {
                        candidates.push(HeapItem { score: -d_n, idx: n_idx });
                        result.push(HeapItem { score: d_n, idx: n_idx });
                        if result.len() > ef {
                            result.pop();
                        }
                    }
                }
            }
        }

        let mut out: Vec<usize> = result.into_iter().map(|h| h.idx).collect();
        out.sort_by(|&a, &b| {
            let da = self.distance(query, &self.nodes[a].vector);
            let db = self.distance(query, &self.nodes[b].vector);
            da.partial_cmp(&db).unwrap_or(Ordering::Equal)
        });
        out
    }

    fn select_neighbors(&self, query: &[f32], candidates: &[usize], m: usize, _layer: usize) -> Vec<usize> {
        let mut sorted = candidates.to_vec();
        sorted.sort_by(|&a, &b| {
            let da = self.distance(query, &self.nodes[a].vector);
            let db = self.distance(query, &self.nodes[b].vector);
            da.partial_cmp(&db).unwrap_or(Ordering::Equal)
        });
        sorted.truncate(m);
        sorted
    }

    pub fn knn_search(&self, query: &[f32], k: usize) -> Vec<(u64, f32)> {
        let ep = match self.entry_point {
            None => return vec![],
            Some(ep) => ep,
        };
        let mut current_ep = ep;
        for l in (1..=self.max_layer).rev() {
            let candidates = self.search_layer(query, current_ep, 1, l);
            if let Some(&best) = candidates.first() {
                current_ep = best;
            }
        }
        let candidates = self.search_layer(query, current_ep, k.max(EF_CONSTRUCTION), 0);
        candidates.iter().take(k).map(|&idx| {
            let node = &self.nodes[idx];
            let sim = compute::cosine_sim(query, &node.vector);
            (node.id, sim)
        }).collect()
    }

    pub fn serialize(&self) -> Vec<u8> {
        serde_json::to_vec(self).unwrap_or_default()
    }

    pub fn deserialize(data: &[u8]) -> Option<Self> {
        serde_json::from_slice(data).ok()
    }
}
