use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use js_sys::{Object, Reflect, Array, Promise};
use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Clone, Serialize, Deserialize)]
pub struct VectorEntry {
    pub id: u64,
    pub vec: Vec<f32>,
    pub text: Option<String>,
    pub metadata: Option<Value>,
}

pub async fn open_db(db_name: &str) -> Result<JsValue, JsValue> {
    let window = web_sys::window().ok_or_else(|| JsValue::from_str("no window"))?;
    let idb_factory = Reflect::get(&window, &JsValue::from_str("indexedDB"))?;
    let open_fn = Reflect::get(&idb_factory, &JsValue::from_str("open"))?.dyn_into::<js_sys::Function>()?;
    let args = Array::new();
    args.push(&JsValue::from_str(db_name));
    args.push(&JsValue::from_f64(1.0));
    let request = Reflect::apply(&open_fn, &idb_factory, &args)?;

    // Listen for onupgradeneeded
    let upgrade_cb = Closure::wrap(Box::new(move |event: web_sys::Event| {
        let target = event.target().unwrap();
        let result = Reflect::get(&target, &JsValue::from_str("result")).unwrap();
        let create_args = Array::new();
        create_args.push(&JsValue::from_str("entries"));
        if let Ok(create_fn) = Reflect::get(&result, &JsValue::from_str("createObjectStore")) {
            if let Ok(f) = create_fn.dyn_into::<js_sys::Function>() {
                let opts = Object::new();
                let _ = Reflect::set(&opts, &JsValue::from_str("keyPath"), &JsValue::from_str("id"));
                create_args.push(&opts);
                let _ = Reflect::apply(&f, &result, &create_args);
            }
        }
    }) as Box<dyn FnMut(web_sys::Event)>);
    let _ = Reflect::set(&request, &JsValue::from_str("onupgradeneeded"), upgrade_cb.as_ref());
    upgrade_cb.forget();

    // Await open success
    let promise = js_sys::Promise::new(&mut |resolve, reject| {
        let req_clone = request.clone();
        let resolve_clone = resolve.clone();
        let reject_clone = reject.clone();

        let success_cb = Closure::wrap(Box::new(move |_event: web_sys::Event| {
            let db = Reflect::get(&req_clone, &JsValue::from_str("result")).unwrap_or(JsValue::NULL);
            let _ = resolve_clone.call1(&JsValue::NULL, &db);
        }) as Box<dyn FnMut(web_sys::Event)>);
        let _ = Reflect::set(&request, &JsValue::from_str("onsuccess"), success_cb.as_ref());
        success_cb.forget();

        let req2 = request.clone();
        let error_cb = Closure::wrap(Box::new(move |_event: web_sys::Event| {
            let err = Reflect::get(&req2, &JsValue::from_str("error")).unwrap_or(JsValue::NULL);
            let _ = reject_clone.call1(&JsValue::NULL, &err);
        }) as Box<dyn FnMut(web_sys::Event)>);
        let _ = Reflect::set(&request, &JsValue::from_str("onerror"), error_cb.as_ref());
        error_cb.forget();
    });
    JsFuture::from(promise).await
}

async fn idb_request_to_future(request: JsValue) -> Result<JsValue, JsValue> {
    let promise = js_sys::Promise::new(&mut |resolve, reject| {
        let r = request.clone();
        let resolve_clone = resolve.clone();
        let reject_clone = reject.clone();
        let sc = Closure::wrap(Box::new(move |_: web_sys::Event| {
            let result = Reflect::get(&r, &JsValue::from_str("result")).unwrap_or(JsValue::NULL);
            let _ = resolve_clone.call1(&JsValue::NULL, &result);
        }) as Box<dyn FnMut(web_sys::Event)>);
        let r2 = request.clone();
        let ec = Closure::wrap(Box::new(move |_: web_sys::Event| {
            let err = Reflect::get(&r2, &JsValue::from_str("error")).unwrap_or(JsValue::NULL);
            let _ = reject_clone.call1(&JsValue::NULL, &err);
        }) as Box<dyn FnMut(web_sys::Event)>);
        let _ = Reflect::set(&request, &JsValue::from_str("onsuccess"), sc.as_ref());
        let _ = Reflect::set(&request, &JsValue::from_str("onerror"), ec.as_ref());
        sc.forget();
        ec.forget();
    });
    JsFuture::from(promise).await
}

pub async fn put_entry(db: &JsValue, entry: &VectorEntry) -> Result<(), JsValue> {
    let json_str = serde_json::to_string(entry).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let tx = get_tx(db, "readwrite")?;
    let store = get_store(&tx)?;
    let obj = js_sys::JSON::parse(&json_str)?;
    let put_fn = Reflect::get(&store, &JsValue::from_str("put"))?.dyn_into::<js_sys::Function>()?;
    let args = Array::new();
    args.push(&obj);
    let req = Reflect::apply(&put_fn, &store, &args)?;
    idb_request_to_future(req).await?;
    Ok(())
}

pub async fn get_all_entries(db: &JsValue) -> Result<Vec<VectorEntry>, JsValue> {
    let tx = get_tx(db, "readonly")?;
    let store = get_store(&tx)?;
    let get_all_fn = Reflect::get(&store, &JsValue::from_str("getAll"))?.dyn_into::<js_sys::Function>()?;
    let req = Reflect::apply(&get_all_fn, &store, &Array::new())?;
    let result = idb_request_to_future(req).await?;
    let arr: Array = result.unchecked_into();
    let mut entries = Vec::new();
    for i in 0..arr.length() {
        let item = arr.get(i);
        let json_str = js_sys::JSON::stringify(&item)
            .map(|s| s.as_string().unwrap_or_default())
            .unwrap_or_default();
        if let Ok(e) = serde_json::from_str::<VectorEntry>(&json_str) {
            entries.push(e);
        }
    }
    Ok(entries)
}

pub async fn delete_entry(db: &JsValue, id: u64) -> Result<(), JsValue> {
    let tx = get_tx(db, "readwrite")?;
    let store = get_store(&tx)?;
    let del_fn = Reflect::get(&store, &JsValue::from_str("delete"))?.dyn_into::<js_sys::Function>()?;
    let args = Array::new();
    args.push(&JsValue::from_f64(id as f64));
    let req = Reflect::apply(&del_fn, &store, &args)?;
    idb_request_to_future(req).await?;
    Ok(())
}

pub async fn clear_store(db: &JsValue) -> Result<(), JsValue> {
    let tx = get_tx(db, "readwrite")?;
    let store = get_store(&tx)?;
    let clear_fn = Reflect::get(&store, &JsValue::from_str("clear"))?.dyn_into::<js_sys::Function>()?;
    let req = Reflect::apply(&clear_fn, &store, &Array::new())?;
    idb_request_to_future(req).await?;
    Ok(())
}

fn get_tx(db: &JsValue, mode: &str) -> Result<JsValue, JsValue> {
    let tx_fn = Reflect::get(db, &JsValue::from_str("transaction"))?.dyn_into::<js_sys::Function>()?;
    let args = Array::new();
    args.push(&JsValue::from_str("entries"));
    args.push(&JsValue::from_str(mode));
    Reflect::apply(&tx_fn, db, &args)
}

fn get_store(tx: &JsValue) -> Result<JsValue, JsValue> {
    let store_fn = Reflect::get(tx, &JsValue::from_str("objectStore"))?.dyn_into::<js_sys::Function>()?;
    let args = Array::new();
    args.push(&JsValue::from_str("entries"));
    Reflect::apply(&store_fn, tx, &args)
}
