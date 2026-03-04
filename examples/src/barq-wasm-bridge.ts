/**
 * barq-wasm bridge
 * Dynamically loads barq-wasm from npm / local pkg and exposes
 * cosine_similarity_simd and dot_product_simd for use as the HNSW
 * distance kernel inside barq-vweb.
 *
 * Falls back to pure JS if barq-wasm is unavailable.
 */

const BARQ_WASM_PKG = '../../barq-wasm/pkg/barq_wasm.js';

interface BarqWasmAPI {
    cosine_similarity_simd: (a: Float32Array, b: Float32Array) => number;
    dot_product_simd: (a: Float32Array, b: Float32Array) => number;
    vector_normalize: (a: Float32Array) => Float32Array;
}

let _api: BarqWasmAPI | null = null;
let _initPromise: Promise<BarqWasmAPI | null> | null = null;

/**
 * Try to load barq-wasm SIMD kernels.
 * Returns API if successful, null if unavailable (falls back to JS).
 */
export async function loadBarqWasm(): Promise<BarqWasmAPI | null> {
    if (_api) return _api;
    if (_initPromise) return _initPromise;

    _initPromise = (async () => {
        try {
            // First try the local barq-wasm pkg if the user has it built
            const mod = await import(/* @vite-ignore */ BARQ_WASM_PKG);
            if (mod.default) await mod.default();       // init()

            if (typeof mod.cosine_similarity_simd === 'function') {
                _api = {
                    cosine_similarity_simd: mod.cosine_similarity_simd,
                    dot_product_simd: mod.dot_product_simd,
                    vector_normalize: mod.vector_normalize,
                };
                console.info('[barq-wasm] SIMD kernels loaded ✅');
                return _api;
            }
        } catch {
            /* barq-wasm not available locally */
        }
        console.info('[barq-wasm] not available, using JS fallback');
        return null;
    })();

    return _initPromise;
}

// ── Scalar JS fallbacks ──────────────────────────────────────

function jsDot(a: Float32Array, b: Float32Array): number {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}

function jsNorm(a: Float32Array): number {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * a[i];
    return Math.sqrt(s);
}

/**
 * Compute cosine similarity — uses barq-wasm SIMD if available.
 */
export async function cosineSim(a: Float32Array, b: Float32Array): Promise<number> {
    const api = await loadBarqWasm();
    if (api) return api.cosine_similarity_simd(a, b);
    const denom = jsNorm(a) * jsNorm(b);
    return denom < 1e-9 ? 0 : jsDot(a, b) / denom;
}

/**
 * Compute dot product — uses barq-wasm SIMD if available.
 */
export async function dotProduct(a: Float32Array, b: Float32Array): Promise<number> {
    const api = await loadBarqWasm();
    if (api) return api.dot_product_simd(a, b);
    return jsDot(a, b);
}

/**
 * Returns a human-readable string describing the active backend.
 */
export function backendLabel(): string {
    return _api ? '⚡ barq-wasm (SIMD)' : 'JS Scalar Fallback';
}
