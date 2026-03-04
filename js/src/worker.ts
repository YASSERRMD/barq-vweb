// Web Worker for heavy insert operations
// Handles INSERT_TEXTS and INSERT_VECTORS messages

let wasmInstance: any = null;

async function ensureInit(collectionName: string, modelUrl?: string) {
    if (!wasmInstance) {
        const mod = await import("../pkg/barq_vweb.js");
        await (mod as any).default?.();
        wasmInstance = new (mod as any).BarqVWeb(collectionName, modelUrl ?? "");
    }
}

self.onmessage = async (event: MessageEvent) => {
    const { type, payload } = event.data;

    try {
        switch (type) {
            case "INSERT_TEXTS": {
                const { collectionName, modelUrl, texts, metadata } = payload;
                await ensureInit(collectionName, modelUrl);
                const arr = texts as unknown as any;
                const meta = (metadata ?? []) as unknown as any;
                const count = await wasmInstance.insert_texts(arr, meta);
                self.postMessage({ type: "INSERT_DONE", count });
                break;
            }
            case "INSERT_VECTORS": {
                const { collectionName, modelUrl, flatVectors, ids, dim } = payload;
                await ensureInit(collectionName, modelUrl);
                const count = await wasmInstance.insert_vectors(
                    new Float32Array(flatVectors),
                    new Uint32Array(ids),
                    dim
                );
                self.postMessage({ type: "INSERT_DONE", count });
                break;
            }
            default:
                self.postMessage({ type: "INSERT_ERROR", error: `Unknown message type: ${type}` });
        }
    } catch (err: any) {
        self.postMessage({ type: "INSERT_ERROR", error: err?.message ?? String(err) });
    }
};
