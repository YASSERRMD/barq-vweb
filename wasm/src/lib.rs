use wasm_bindgen::prelude::*;
use js_sys::Promise;

pub mod compute;

#[wasm_bindgen]
pub struct BarqVWeb {
    // Phase 1 stubs
}

#[wasm_bindgen]
impl BarqVWeb {
    #[wasm_bindgen(constructor)]
    pub fn new(collection_name: String, model_url: Option<String>) -> Self {
        Self {}
    }

    #[wasm_bindgen]
    pub fn insert_texts(&self, texts: js_sys::Array, metadata: js_sys::Array) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn insert_vectors(&self, vectors: js_sys::Float32Array, ids: js_sys::Uint32Array) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn search(&self, query: String, top_k: usize, hybrid: bool) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn search_vector(&self, query_v: js_sys::Float32Array, top_k: usize) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn delete(&self, id: u32) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn clear(&self) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn save(&self) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn load(&self) -> Promise {
        Promise::resolve(&JsValue::UNDEFINED)
    }

    #[wasm_bindgen]
    pub fn count(&self) -> usize {
        0
    }

    #[wasm_bindgen]
    pub fn backend_info(&self) -> String {
        "stub".to_string()
    }
}
