use wasm_bindgen::prelude::*;
use js_sys::Reflect;
use wasm_bindgen_futures::JsFuture;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Backend {
    WebGPU,
    WebNN,
    BarqWasm,
    Scalar,
}

pub fn is_mac_m_series() -> bool {
    if let Some(window) = web_sys::window() {
        let nav = window.navigator();
        if let Ok(ua_val) = Reflect::get(&nav, &JsValue::from_str("userAgent")) {
            if let Some(ua) = ua_val.as_string() {
                // Approximate check for Mac ARM
                if ua.contains("Mac") && (ua.contains("AppleWebKit") || ua.contains("Safari")) {
                    return true;
                }
            }
        }
    }
    false
}

pub async fn probe_backend() -> Backend {
    // 1. Check WebGPU
    if let Some(window) = web_sys::window() {
        let nav = window.navigator();
        if let Ok(gpu_val) = Reflect::get(&nav, &JsValue::from_str("gpu")) {
            if !gpu_val.is_undefined() {
                if let Ok(gpu) = gpu_val.dyn_into::<web_sys::Gpu>() {
                    let adapter_promise = gpu.request_adapter();
                    if let Ok(adapter_val) = JsFuture::from(adapter_promise).await {
                        if !adapter_val.is_null() && !adapter_val.is_undefined() {
                            return Backend::WebGPU;
                        }
                    }
                }
            }
        }
        
        // 2. Check WebNN (mock check for navigator.ml)
        if let Ok(ml_val) = Reflect::get(&nav, &JsValue::from_str("ml")) {
            if !ml_val.is_undefined() {
                return Backend::WebNN;
            }
        }
    }
    
    // 3. Check BarqWasm
    if let Ok(bw) = Reflect::get(&js_sys::global(), &JsValue::from_str("__barqWasm")) {
        if !bw.is_undefined() {
            return Backend::BarqWasm;
        }
    }

    Backend::Scalar
}
