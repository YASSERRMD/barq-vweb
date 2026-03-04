pub mod idb;
pub mod opfs;

pub use idb::VectorEntry;

use crate::index::{HnswIndex, PqCompressor};
use wasm_bindgen::prelude::*;

const IDB_SIZE_THRESHOLD: usize = 10 * 1024 * 1024; // 10MB

pub async fn save_index(collection: &str, hnsw: &HnswIndex) -> Result<(), JsValue> {
    let bytes = hnsw.serialize();
    let name = format!("{}.hnsw", collection);
    opfs::write_raw(&name, &bytes).await
        .map_err(|e| JsValue::from_str(&format!("save_index opfs error: {:?}", e)))
}

pub async fn load_index(collection: &str) -> Result<Option<HnswIndex>, JsValue> {
    let name = format!("{}.hnsw", collection);
    match opfs::read_raw(&name).await {
        Ok(bytes) => Ok(HnswIndex::deserialize(&bytes)),
        Err(_) => Ok(None),
    }
}

pub async fn save_entries(collection: &str, entries: &[VectorEntry]) -> Result<(), JsValue> {
    // Always use IDB for entries (serialized JSON is fine for metadata + vectors under 10MB)
    let db_name = format!("barq_{}", collection);
    let db = idb::open_db(&db_name).await?;
    for entry in entries {
        idb::put_entry(&db, entry).await?;
    }
    Ok(())
}

pub async fn load_entries(collection: &str) -> Result<Vec<VectorEntry>, JsValue> {
    let db_name = format!("barq_{}", collection);
    let db = idb::open_db(&db_name).await?;
    idb::get_all_entries(&db).await
}
