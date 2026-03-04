// Shared barq-vweb WASM loader — single instance across demos
// vite-plugin-wasm handles the .wasm binary serving and top-level-await
import init, { BarqVWeb as BarqVWebImpl } from 'barq-vweb';
import { loadEmbedder } from './embedder';
import { loadBarqWasm, backendLabel } from './barq-wasm-bridge';

let _ready = false;
let _initPromise: Promise<void> | null = null;

export async function getWasm(): Promise<{ BarqVWeb: typeof BarqVWebImpl }> {
    if (!_ready) {
        if (!_initPromise) {
            _initPromise = init().then(() => { _ready = true; });
        }
        await _initPromise;
    }
    return { BarqVWeb: BarqVWebImpl };
}

export function makeDB(
    mod: { BarqVWeb: typeof BarqVWebImpl },
    collectionName: string
): InstanceType<typeof BarqVWebImpl> {
    return new mod.BarqVWeb(collectionName, undefined);
}

// ── Embedder (MiniLM-L6-v2 int8 via Transformers.js) ─────────
export { loadEmbedder, embedTexts } from './embedder';

// ── barq-wasm acceleration bridge ────────────────────────────
export { loadBarqWasm, backendLabel, cosineSim, dotProduct } from './barq-wasm-bridge';

// ── DOM helpers ──────────────────────────────────────────────
export function el<T extends HTMLElement>(tag: string, cls?: string, text?: string): T {
    const e = document.createElement(tag) as T;
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
}

export function setStatus(el: HTMLElement, msg: string, type: 'ok' | 'err' | '' = '') {
    el.textContent = msg;
    el.className = `status ${type}`;
}
