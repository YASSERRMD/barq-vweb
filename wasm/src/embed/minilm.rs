use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use js_sys::{Array, ArrayBuffer, Promise, Reflect, Uint8Array};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

// MiniLM produces 384-dim embeddings
const EMBED_DIM: usize = 384;
const MAX_SEQ_LEN: usize = 128;

pub struct MiniLm {
    /// Vocabulary: token -> id
    vocab: HashMap<String, u32>,
    model_url: String,
    /// Cached ORT session handle (stored as opaque JsValue)
    session: Option<JsValue>,
}

impl MiniLm {
    pub fn new(model_url: String) -> Self {
        Self {
            vocab: HashMap::new(),
            model_url,
            session: None,
        }
    }

    /// Initialize: load vocab and session from OPFS cache or fetch
    pub async fn init(&mut self) -> Result<(), JsValue> {
        // Load vocab (simple whitespace tokenizer requires no vocab file)
        // Real wordpiece vocab loading would be done here
        self.build_stub_vocab();
        // ORT session loading is deferred until Phase 5 full implementation
        // because ORT WASM binary loading is complex; we stub it here
        Ok(())
    }

    fn build_stub_vocab(&mut self) {
        // Stub: maps single chars a-z to IDs for basic tokenization tests
        for (i, c) in ('a'..='z').enumerate() {
            self.vocab.insert(c.to_string(), (i + 1000) as u32);
        }
        self.vocab.insert("[CLS]".to_string(), 101);
        self.vocab.insert("[SEP]".to_string(), 102);
        self.vocab.insert("[UNK]".to_string(), 100);
        self.vocab.insert("[PAD]".to_string(), 0);
    }

    fn tokenize(&self, text: &str) -> Vec<u32> {
        let mut ids = vec![101u32]; // [CLS]
        for word in text.split_whitespace() {
            let lower = word.to_lowercase();
            if let Some(&id) = self.vocab.get(&lower) {
                ids.push(id);
            } else {
                // Character-level fallback
                for c in lower.chars().take(10) {
                    if let Some(&id) = self.vocab.get(&c.to_string()) {
                        ids.push(id);
                    } else {
                        ids.push(100); // [UNK]
                    }
                }
            }
            if ids.len() >= MAX_SEQ_LEN - 1 { break; }
        }
        ids.push(102); // [SEP]
        ids.resize(MAX_SEQ_LEN, 0); // [PAD]
        ids
    }

    /// Stub embed: returns a deterministic vector derived from token ids
    /// Real implement would call ORT session.run() when session is loaded
    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, JsValue> {
        let token_ids = self.tokenize(text);
        // Stub: generate a 384-dim vector from token_ids via simple hash
        let mut v = vec![0.0f32; EMBED_DIM];
        for (i, &tid) in token_ids.iter().enumerate() {
            let pos = (tid as usize + i) % EMBED_DIM;
            v[pos] += 1.0;
        }
        // L2-normalize
        let norm: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 1e-9 {
            for x in &mut v { *x /= norm; }
        }
        Ok(v)
    }

    pub async fn embed_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>, JsValue> {
        let mut results = Vec::with_capacity(texts.len());
        for text in texts {
            results.push(self.embed(text).await?);
        }
        Ok(results)
    }
}
