use std::collections::HashMap;
use serde::{Serialize, Deserialize};

const K1: f32 = 1.5;
const B: f32 = 0.75;

#[derive(Clone, Serialize, Deserialize)]
pub struct BM25 {
    /// inverted index: term -> list of (doc_id, term_freq)
    inverted: HashMap<String, Vec<(String, u32)>>,
    /// doc_id -> length (number of terms)
    doc_lengths: HashMap<String, usize>,
    avg_doc_len: f32,
}

impl BM25 {
    pub fn new() -> Self {
        Self {
            inverted: HashMap::new(),
            doc_lengths: HashMap::new(),
            avg_doc_len: 0.0,
        }
    }

    fn tokenize(text: &str) -> Vec<String> {
        text.split_whitespace()
            .map(|w| w.to_lowercase().chars().filter(|c| c.is_alphanumeric()).collect::<String>())
            .filter(|s| !s.is_empty())
            .collect()
    }

    pub fn add_doc(&mut self, doc_id: &str, text: &str) {
        let terms = Self::tokenize(text);
        let len = terms.len();
        self.doc_lengths.insert(doc_id.to_string(), len);

        // Recompute avg_doc_len
        let total: usize = self.doc_lengths.values().sum();
        self.avg_doc_len = total as f32 / self.doc_lengths.len() as f32;

        // Count term frequencies per doc
        let mut tf_map: HashMap<String, u32> = HashMap::new();
        for term in &terms {
            *tf_map.entry(term.clone()).or_insert(0) += 1;
        }
        for (term, tf) in tf_map {
            let list = self.inverted.entry(term).or_default();
            // Update or insert
            if let Some(entry) = list.iter_mut().find(|(id, _)| id == doc_id) {
                entry.1 = tf;
            } else {
                list.push((doc_id.to_string(), tf));
            }
        }
    }

    pub fn remove_doc(&mut self, doc_id: &str) {
        self.doc_lengths.remove(doc_id);
        for list in self.inverted.values_mut() {
            list.retain(|(id, _)| id != doc_id);
        }
    }

    pub fn search(&self, query: &str, top_k: usize) -> Vec<(String, f32)> {
        let terms = Self::tokenize(query);
        let n = self.doc_lengths.len() as f32;
        let mut scores: HashMap<String, f32> = HashMap::new();

        for term in &terms {
            if let Some(postings) = self.inverted.get(term) {
                let df = postings.len() as f32;
                let idf = ((n - df + 0.5) / (df + 0.5) + 1.0).ln();
                for (doc_id, tf) in postings {
                    let dl = self.doc_lengths.get(doc_id).copied().unwrap_or(1) as f32;
                    let tf_norm = (*tf as f32 * (K1 + 1.0)) / (*tf as f32 + K1 * (1.0 - B + B * dl / self.avg_doc_len.max(1.0)));
                    *scores.entry(doc_id.clone()).or_insert(0.0) += idf * tf_norm;
                }
            }
        }

        let mut ranked: Vec<(String, f32)> = scores.into_iter().collect();
        ranked.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        ranked.truncate(top_k);
        ranked
    }

    pub fn serialize(&self) -> Vec<u8> {
        serde_json::to_vec(self).unwrap_or_default()
    }

    pub fn deserialize(data: &[u8]) -> Option<Self> {
        serde_json::from_slice(data).ok()
    }
}
