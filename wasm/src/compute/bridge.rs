use wasm_bindgen::prelude::*;
use js_sys::{Reflect, Function, Float32Array};

fn get_barq_wasm() -> Option<JsValue> {
    Reflect::get(&js_sys::global(), &JsValue::from_str("__barqWasm")).ok()
}

pub fn cosine_sim(a: &[f32], b: &[f32]) -> f32 {
    if let Some(bw) = get_barq_wasm() {
        if !bw.is_undefined() {
            if let Ok(func) = Reflect::get(&bw, &JsValue::from_str("cosine_sim")) {
                if let Ok(f) = func.dyn_into::<Function>() {
                    let ja = Float32Array::from(a);
                    let jb = Float32Array::from(b);
                    if let Ok(res) = f.call2(&JsValue::NULL, &ja, &jb) {
                        if let Some(num) = res.as_f64() {
                            return num as f32;
                        }
                    }
                }
            }
        }
    }
    // Fallback scalar
    fallback_cosine_sim(a, b)
}

pub fn batch_cosine(query: &[f32], corpus: &[f32], n: usize, d: usize) -> Vec<f32> {
    if let Some(bw) = get_barq_wasm() {
        if !bw.is_undefined() {
            if let Ok(func) = Reflect::get(&bw, &JsValue::from_str("batch_cosine")) {
                if let Ok(f) = func.dyn_into::<Function>() {
                    let jq = Float32Array::from(query);
                    let jc = Float32Array::from(corpus);
                    let jn = JsValue::from_f64(n as f64);
                    let jd = JsValue::from_f64(d as f64);
                    if let Ok(res) = f.call4(&JsValue::NULL, &jq, &jc, &jn, &jd) {
                        if res.is_instance_of::<Float32Array>() {
                            let arr: Float32Array = res.unchecked_into();
                            return arr.to_vec();
                        }
                    }
                }
            }
        }
    }
    fallback_batch_cosine(query, corpus, n, d)
}

pub fn matmul(a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
    if let Some(bw) = get_barq_wasm() {
        if !bw.is_undefined() {
            if let Ok(func) = Reflect::get(&bw, &JsValue::from_str("matmul")) {
                if let Ok(f) = func.dyn_into::<Function>() {
                    let ja = Float32Array::from(a);
                    let jb = Float32Array::from(b);
                    let jm = JsValue::from_f64(m as f64);
                    let jn = JsValue::from_f64(n as f64);
                    let jk = JsValue::from_f64(k as f64);
                    // Call func (up to 5 args) using apply
                    let args = js_sys::Array::new();
                    args.push(&ja); args.push(&jb); args.push(&jm); args.push(&jn); args.push(&jk);
                    if let Ok(res) = Reflect::apply(&f, &JsValue::NULL, &args) {
                        if res.is_instance_of::<Float32Array>() {
                            let arr: Float32Array = res.unchecked_into();
                            return arr.to_vec();
                        }
                    }
                }
            }
        }
    }
    fallback_matmul(a, b, m, n, k)
}

pub fn quantize_int8(data: &[f32]) -> Vec<i8> {
    if let Some(bw) = get_barq_wasm() {
        if !bw.is_undefined() {
            if let Ok(func) = Reflect::get(&bw, &JsValue::from_str("quantize_int8")) {
                if let Ok(f) = func.dyn_into::<Function>() {
                    let jd = Float32Array::from(data);
                    if let Ok(res) = f.call1(&JsValue::NULL, &jd) {
                        if res.is_instance_of::<js_sys::Int8Array>() {
                            let arr: js_sys::Int8Array = res.unchecked_into();
                            return arr.to_vec();
                        }
                    }
                }
            }
        }
    }
    fallback_quantize_int8(data)
}

// Fallbacks
fn fallback_cosine_sim(a: &[f32], b: &[f32]) -> f32 {
    let mut dot = 0.0;
    let mut anorm = 0.0;
    let mut bnorm = 0.0;
    for i in 0..a.len() {
        dot += a[i] * b[i];
        anorm += a[i] * a[i];
        bnorm += b[i] * b[i];
    }
    if anorm == 0.0 || bnorm == 0.0 { return 0.0; }
    dot / (anorm.sqrt() * bnorm.sqrt())
}

fn fallback_batch_cosine(query: &[f32], corpus: &[f32], n: usize, d: usize) -> Vec<f32> {
    let mut res = Vec::with_capacity(n);
    for i in 0..n {
        let b = &corpus[i*d..(i+1)*d];
        res.push(fallback_cosine_sim(query, b));
    }
    res
}

fn fallback_matmul(a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
    let mut res = vec![0.0; m * n];
    for i in 0..m {
        for j in 0..n {
            let mut sum = 0.0;
            for l in 0..k {
                sum += a[i * k + l] * b[l * n + j];
            }
            res[i * n + j] = sum;
        }
    }
    res
}

fn fallback_quantize_int8(data: &[f32]) -> Vec<i8> {
    data.iter().map(|&x| (x * 127.0).clamp(-127.0, 127.0) as i8).collect()
}
