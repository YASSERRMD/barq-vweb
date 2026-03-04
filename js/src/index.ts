import type { SearchResult, BackendInfo, InsertOptions, SearchOptions, VectorEntry } from "./types";

declare const __barqWasm: any;

export class BarqVWeb {
    private wasmInstance: any;
    private collectionName: string;
    private modelUrl: string;

    constructor(collectionName: string, modelUrl?: string) {
        this.collectionName = collectionName;
        this.modelUrl = modelUrl ?? "https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx";
    }

    async init(): Promise<void> {
        // 1. Try to initialize barq-wasm for hardware acceleration
        try {
            if (typeof window !== "undefined" && !(window as any).__barqWasm) {
                // barq-wasm would be loaded externally and registered on globalThis
                console.log("[barq-vweb] barq-wasm not found, using scalar fallback");
            }
        } catch (e) {
            /* ignore */
        }

        // 2. Load the WASM module
        const mod = await import("../pkg/barq_vweb.js");
        await (mod as any).default?.();
        this.wasmInstance = new mod.BarqVWeb(this.collectionName, this.modelUrl);
    }

    async insertTexts(texts: string[], metadata?: any[], opts?: InsertOptions): Promise<number> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        const arr = texts as unknown as any;
        const meta = (metadata ?? []) as unknown as any;
        return this.wasmInstance.insert_texts(arr, meta);
    }

    async insertVectors(vectors: Float32Array[], ids: Uint32Array, opts?: InsertOptions): Promise<number> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        const flat = new Float32Array(vectors.reduce((acc, v) => acc + v.length, 0));
        let offset = 0;
        for (const v of vectors) { flat.set(v, offset); offset += v.length; }
        const dim = vectors[0]?.length ?? 1;
        return this.wasmInstance.insert_vectors(flat, ids, dim);
    }

    async search(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        return this.wasmInstance.search(query, opts?.topK ?? 5, opts?.hybrid ?? true);
    }

    async searchVector(query: Float32Array, topK = 5): Promise<SearchResult[]> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        return this.wasmInstance.search_vector(query, topK);
    }

    async save(): Promise<void> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        return this.wasmInstance.save();
    }

    async load(): Promise<void> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        return this.wasmInstance.load();
    }

    async clear(): Promise<void> {
        if (!this.wasmInstance) throw new Error("Call init() first");
        return this.wasmInstance.clear();
    }

    count(): number {
        return this.wasmInstance?.count() ?? 0;
    }

    backendInfo(): string {
        return this.wasmInstance?.backend_info() ?? "not initialized";
    }
}
