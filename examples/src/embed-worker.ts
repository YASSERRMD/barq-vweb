/**
 * embed-worker.ts
 * Runs in a Web Worker. Loads MiniLM-L6-v2 (int8 quantized) via
 * Hugging Face Transformers.js and responds to embed requests.
 *
 * Model: sentence-transformers/all-MiniLM-L6-v2
 *   - 22M params → ~6MB (int8 quantized ONNX)
 *   - 384-dim output, mean-pooled
 *   - Best-in-class MTEB STS benchmark for <30MB models
 */

import { pipeline, env } from '@huggingface/transformers';

// Use ONNX Runtime Web backend bundled with transformers.js
// Cache model in OPFS after first download
env.useBrowserCache = true;
env.allowLocalModels = false;

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

let extractor: Awaited<ReturnType<typeof pipeline>> | null = null;

async function loadModel(onProgress?: (pct: number) => void) {
    if (extractor) return extractor;

    extractor = await pipeline('feature-extraction', MODEL_ID, {
        quantized: true,   // int8 — ~6MB vs 23MB fp32
        dtype: 'q8',       // explicit int8
        progress_callback: (info: any) => {
            if (info.status === 'progress' && onProgress) {
                onProgress(Math.round(info.progress ?? 0));
            }
        },
    });
    return extractor;
}

async function embed(texts: string[]): Promise<number[][]> {
    const model = await loadModel();
    const output = await model(texts, { pooling: 'mean', normalize: true });
    // output.data is a flat Float32Array [n * 384]
    const dim = 384;
    const data = output.data as Float32Array;
    const result: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
        result.push(Array.from(data.subarray(i * dim, (i + 1) * dim)));
    }
    return result;
}

// ── Message handler ──────────────────────────────────────────
self.onmessage = async (e: MessageEvent) => {
    const { id, type, payload } = e.data;

    try {
        switch (type) {
            case 'LOAD': {
                await loadModel((pct) => {
                    self.postMessage({ id, type: 'LOAD_PROGRESS', pct });
                });
                self.postMessage({ id, type: 'LOAD_DONE' });
                break;
            }
            case 'EMBED': {
                const { texts } = payload as { texts: string[] };
                const vectors = await embed(texts);
                self.postMessage({ id, type: 'EMBED_DONE', vectors });
                break;
            }
            default:
                self.postMessage({ id, type: 'ERROR', error: `Unknown type: ${type}` });
        }
    } catch (err: any) {
        self.postMessage({ id, type: 'ERROR', error: err?.message ?? String(err) });
    }
};
