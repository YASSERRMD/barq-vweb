/**
 * barq-wasm bridge
 * Uses barq-wasm SIMD-accelerated kernels from the local pkg build.
 * key exports: cosine_similarity_simd, dot_product_simd, vector_norm_simd
 *
 * Falls back to pure JS if barq-wasm init fails.
 */

import initBarqWasm, {
    cosine_similarity_simd as _cosine,
    dot_product_simd as _dot,
    vector_norm_simd as _norm,
} from 'barq-wasm';

let _ready = false;
let _initPromise: Promise<void> | null = null;

/**
 * Initialize barq-wasm SIMD kernels.
 * Returns true if SIMD is available, false if fallback.
 */
export async function loadBarqWasm(): Promise<boolean> {
    if (_ready) return true;
    if (!_initPromise) {
        _initPromise = initBarqWasm()
            .then(() => { _ready = true; })
            .catch(e => {
                console.warn('[barq-wasm] init failed, using JS fallback:', e);
            });
    }
    await _initPromise;
    return _ready;
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
 * Cosine similarity — uses barq-wasm 16-wide SIMD kernel when available.
 */
export async function cosineSim(a: Float32Array, b: Float32Array): Promise<number> {
    if (_ready) return _cosine(a, b);
    const denom = jsNorm(a) * jsNorm(b);
    return denom < 1e-9 ? 0 : jsDot(a, b) / denom;
}

/**
 * Dot product — uses barq-wasm 16-wide SIMD kernel when available.
 */
export async function dotProduct(a: Float32Array, b: Float32Array): Promise<number> {
    if (_ready) return _dot(a, b);
    return jsDot(a, b);
}

/**
 * Human-readable backend label.
 */
export function backendLabel(): string {
    return _ready ? '⚡ barq-wasm (SIMD)' : 'JS Scalar Fallback';
}
