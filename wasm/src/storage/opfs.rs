use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use js_sys::{Reflect, Array, Promise, Uint8Array};

pub async fn write_flat(name: &str, data: &[f32]) -> Result<(), JsValue> {
    let dir = get_opfs_root().await?;
    let fh = get_file_handle(&dir, name, true).await?;
    let writable = get_writable(&fh).await?;
    let bytes = floats_to_bytes(data);
    let write_fn = Reflect::get(&writable, &JsValue::from_str("write"))?.dyn_into::<js_sys::Function>()?;
    let buf = Uint8Array::from(bytes.as_slice());
    let args = Array::new();
    args.push(&buf.buffer());
    JsFuture::from(Reflect::apply(&write_fn, &writable, &args)?.unchecked_into::<Promise>()).await?;
    close_writable(&writable).await?;
    Ok(())
}

pub async fn read_flat(name: &str) -> Result<Vec<f32>, JsValue> {
    let dir = get_opfs_root().await?;
    let fh = get_file_handle(&dir, name, false).await?;
    let get_file_fn = Reflect::get(&fh, &JsValue::from_str("getFile"))?.dyn_into::<js_sys::Function>()?;
    let file_val = JsFuture::from(Reflect::apply(&get_file_fn, &fh, &Array::new())?.unchecked_into::<Promise>()).await?;
    let arr_buf_promise = Reflect::get(&file_val, &JsValue::from_str("arrayBuffer"))?.dyn_into::<js_sys::Function>()?;
    let arr_buf = JsFuture::from(Reflect::apply(&arr_buf_promise, &file_val, &Array::new())?.unchecked_into::<Promise>()).await?;
    let u8arr = Uint8Array::new(&arr_buf);
    Ok(bytes_to_floats(&u8arr.to_vec()))
}

pub async fn write_raw(name: &str, data: &[u8]) -> Result<(), JsValue> {
    let dir = get_opfs_root().await?;
    let fh = get_file_handle(&dir, name, true).await?;
    let writable = get_writable(&fh).await?;
    let write_fn = Reflect::get(&writable, &JsValue::from_str("write"))?.dyn_into::<js_sys::Function>()?;
    let buf = Uint8Array::from(data);
    let args = Array::new();
    args.push(&buf.buffer());
    JsFuture::from(Reflect::apply(&write_fn, &writable, &args)?.unchecked_into::<Promise>()).await?;
    close_writable(&writable).await?;
    Ok(())
}

pub async fn read_raw(name: &str) -> Result<Vec<u8>, JsValue> {
    let dir = get_opfs_root().await?;
    let fh = get_file_handle(&dir, name, false).await?;
    let get_file_fn = Reflect::get(&fh, &JsValue::from_str("getFile"))?.dyn_into::<js_sys::Function>()?;
    let file_val = JsFuture::from(Reflect::apply(&get_file_fn, &fh, &Array::new())?.unchecked_into::<Promise>()).await?;
    let arr_buf_fn = Reflect::get(&file_val, &JsValue::from_str("arrayBuffer"))?.dyn_into::<js_sys::Function>()?;
    let arr_buf = JsFuture::from(Reflect::apply(&arr_buf_fn, &file_val, &Array::new())?.unchecked_into::<Promise>()).await?;
    let u8arr = Uint8Array::new(&arr_buf);
    Ok(u8arr.to_vec())
}

async fn get_opfs_root() -> Result<JsValue, JsValue> {
    // works in both Window and Worker contexts
    let global = js_sys::global();
    let nav = Reflect::get(&global, &JsValue::from_str("navigator"))?;
    let storage = Reflect::get(&nav, &JsValue::from_str("storage"))?;
    let get_dir_fn = Reflect::get(&storage, &JsValue::from_str("getDirectory"))?.dyn_into::<js_sys::Function>()?;
    JsFuture::from(Reflect::apply(&get_dir_fn, &storage, &Array::new())?.unchecked_into::<Promise>()).await
}

async fn get_file_handle(dir: &JsValue, name: &str, create: bool) -> Result<JsValue, JsValue> {
    let fn_val = Reflect::get(dir, &JsValue::from_str("getFileHandle"))?.dyn_into::<js_sys::Function>()?;
    let opts = js_sys::Object::new();
    Reflect::set(&opts, &JsValue::from_str("create"), &JsValue::from_bool(create))?;
    let args = Array::new();
    args.push(&JsValue::from_str(name));
    args.push(&opts);
    JsFuture::from(Reflect::apply(&fn_val, dir, &args)?.unchecked_into::<Promise>()).await
}

async fn get_writable(fh: &JsValue) -> Result<JsValue, JsValue> {
    let fn_val = Reflect::get(fh, &JsValue::from_str("createWritable"))?.dyn_into::<js_sys::Function>()?;
    JsFuture::from(Reflect::apply(&fn_val, fh, &Array::new())?.unchecked_into::<Promise>()).await
}

async fn close_writable(writable: &JsValue) -> Result<(), JsValue> {
    let fn_val = Reflect::get(writable, &JsValue::from_str("close"))?.dyn_into::<js_sys::Function>()?;
    JsFuture::from(Reflect::apply(&fn_val, writable, &Array::new())?.unchecked_into::<Promise>()).await?;
    Ok(())
}

fn floats_to_bytes(floats: &[f32]) -> Vec<u8> {
    let mut out = Vec::with_capacity(floats.len() * 4);
    for f in floats {
        out.extend_from_slice(&f.to_le_bytes());
    }
    out
}

fn bytes_to_floats(bytes: &[u8]) -> Vec<f32> {
    bytes.chunks_exact(4).map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]])).collect()
}
