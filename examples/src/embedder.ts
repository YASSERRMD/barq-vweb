/**
 * embedder.ts
 * Main-thread API over the embed-worker Web Worker.
 * Exposes: load(), embed(texts) -> Float32Array[]
 */

type Resolve<T> = (v: T) => void;
type Reject = (e: Error) => void;

interface PendingCall {
    resolve: Resolve<any>;
    reject: Reject;
}

let worker: Worker | null = null;
let callId = 0;
const pending = new Map<number, PendingCall>();

export type ProgressCallback = (pct: number) => void;
let _progressCb: ProgressCallback | null = null;

function getWorker(): Worker {
    if (worker) return worker;
    worker = new Worker(new URL('./embed-worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
        const { id, type, vectors, pct, error } = e.data;
        if (type === 'LOAD_PROGRESS') {
            _progressCb?.(pct);
            return;                        // no pending call to resolve yet
        }
        const call = pending.get(id);
        if (!call) return;
        pending.delete(id);
        if (type === 'ERROR') {
            call.reject(new Error(error));
        } else {
            call.resolve(vectors ?? undefined);
        }
    };
    return worker;
}

function call<T>(type: string, payload: any = {}): Promise<T> {
    const id = ++callId;
    return new Promise<T>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        getWorker().postMessage({ id, type, payload });
    });
}

/**
 * Pre-load and warm the model. Shows download progress via callback.
 */
export async function loadEmbedder(onProgress?: ProgressCallback): Promise<void> {
    _progressCb = onProgress ?? null;
    await call<void>('LOAD', {});
    _progressCb = null;
}

/**
 * Embed an array of strings. Returns one Float32Array (384-dim) per text.
 */
export async function embedTexts(texts: string[]): Promise<Float32Array[]> {
    const arrays: number[][] = await call<number[][]>('EMBED', { texts });
    return arrays.map(a => new Float32Array(a));
}
