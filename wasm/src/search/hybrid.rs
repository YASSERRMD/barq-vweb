use crate::search::bm25::BM25;
use serde::{Serialize, Deserialize};

const RRF_K: f32 = 60.0;

#[derive(Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub score: f32,
}

pub fn rrf_merge(
    bm25_results: &[(String, f32)],
    cosine_results: &[(String, f32)],
) -> Vec<SearchResult> {
    let mut scores: std::collections::HashMap<String, f32> = std::collections::HashMap::new();

    for (rank, (doc_id, _)) in bm25_results.iter().enumerate() {
        *scores.entry(doc_id.clone()).or_insert(0.0) += 1.0 / (RRF_K + rank as f32 + 1.0);
    }
    for (rank, (doc_id, _)) in cosine_results.iter().enumerate() {
        *scores.entry(doc_id.clone()).or_insert(0.0) += 1.0 / (RRF_K + rank as f32 + 1.0);
    }

    let mut merged: Vec<SearchResult> = scores.into_iter()
        .map(|(id, score)| SearchResult { id, score })
        .collect();
    merged.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    merged
}
