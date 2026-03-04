// Shared barq-vweb WASM loader — single instance across demos
let _mod: any = null;
let _initPromise: Promise<any> | null = null;

export async function getWasm(): Promise<any> {
    if (_mod) return _mod;
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
        const mod = await import('barq-vweb');
        await (mod as any).default?.();
        _mod = mod;
        return mod;
    })();
    return _initPromise;
}

export function makeDB(mod: any, collectionName: string): any {
    return new mod.BarqVWeb(collectionName, null);
}

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
