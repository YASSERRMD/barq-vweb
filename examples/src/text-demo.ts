import { getWasm, makeDB, embedTexts, el, setStatus } from './shared';

const SAMPLE_TEXTS = [
    'Rust is a systems programming language focused on safety and performance.',
    'WebAssembly enables near-native speed in the browser.',
    'barq-vweb is a browser-native vector database built on Rust and WASM.',
    'HNSW is a graph-based algorithm for approximate nearest neighbour search.',
    'Cosine similarity measures the angle between two vectors.',
    'Product quantization compresses vectors by encoding subspaces.',
    'IndexedDB stores structured data client-side in the browser.',
    'OPFS is the Origin Private File System — a high-performance browser FS.',
    'BM25 is a ranking function based on term frequency and document length.',
    'Reciprocal Rank Fusion merges ranked lists from multiple retrieval methods.',
];

export function mountTextDemo(root: HTMLElement) {
    root.innerHTML = `
    <div class="card">
      <div class="card-title">📥 Add Documents</div>
      <div class="input-row">
        <input type="text" id="td-input" placeholder="Enter text to store…" />
        <button class="btn" id="td-store">Store</button>
      </div>
      <p class="status" id="td-store-status">⏳ Model loading in background…</p>
      <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn-sm" id="td-load-samples">Load 10 samples</button>
        <button class="btn btn-sm" id="td-clear">Clear all</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔍 Semantic Search (MiniLM-L6-v2)</div>
      <div class="input-row">
        <input type="text" id="td-query" placeholder="Search stored documents…" />
        <button class="btn" id="td-search">Search</button>
      </div>
      <p class="status" id="td-search-status"></p>
      <div id="td-results" class="list"></div>
    </div>

    <div class="card">
      <div class="card-title">📚 Stored Documents</div>
      <div class="count-pill" id="td-count">0 stored</div>
      <div id="td-docs" class="list"></div>
    </div>
  `;

    const input = root.querySelector<HTMLInputElement>('#td-input')!;
    const storeBtn = root.querySelector<HTMLButtonElement>('#td-store')!;
    const samplesBtn = root.querySelector<HTMLButtonElement>('#td-load-samples')!;
    const clearBtn = root.querySelector<HTMLButtonElement>('#td-clear')!;
    const queryInput = root.querySelector<HTMLInputElement>('#td-query')!;
    const searchBtn = root.querySelector<HTMLButtonElement>('#td-search')!;
    const storeStatus = root.querySelector<HTMLElement>('#td-store-status')!;
    const searchStatus = root.querySelector<HTMLElement>('#td-search-status')!;
    const resultsList = root.querySelector<HTMLElement>('#td-results')!;
    const docsList = root.querySelector<HTMLElement>('#td-docs')!;
    const countPill = root.querySelector<HTMLElement>('#td-count')!;

    let db: any = null;
    const docs: string[] = [];
    // Store embeddings locally so we can display matched text
    const embeddings: Float32Array[] = [];

    async function getDb() {
        if (db) return db;
        const mod = await getWasm();
        db = makeDB(mod, 'text-demo');
        return db;
    }

    function refreshDocs() {
        docsList.innerHTML = '';
        docs.slice(-20).reverse().forEach(text => {
            const item = el('div', 'list-item');
            item.innerHTML = `<span class="item-text">${escHtml(text)}</span>`;
            docsList.appendChild(item);
        });
        countPill.textContent = `${docs.length} stored`;
    }

    async function storeText(text: string) {
        if (!text.trim()) return;
        // 1. Embed with real MiniLM
        const [vec] = await embedTexts([text]);
        // 2. Insert into HNSW via barq-vweb
        const instance = await getDb();
        const id = docs.length;
        const flatArr = vec;
        const ids = new Uint32Array([id]);
        await instance.insert_vectors(flatArr, ids, 384);
        docs.push(text);
        embeddings.push(vec);
        setStatus(storeStatus, `✅ Stored: "${text.slice(0, 50)}"`, 'ok');
        refreshDocs();
    }

    storeBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;
        try {
            storeBtn.disabled = true;
            setStatus(storeStatus, '⏳ Embedding…', '');
            await storeText(text);
            input.value = '';
        } catch (e: any) {
            setStatus(storeStatus, `❌ ${e.message}`, 'err');
        } finally { storeBtn.disabled = false; }
    });

    samplesBtn.addEventListener('click', async () => {
        samplesBtn.disabled = true;
        setStatus(storeStatus, '⏳ Embedding 10 samples…', '');
        try {
            // Batch embed all samples at once for speed
            const vecs = await embedTexts(SAMPLE_TEXTS);
            const instance = await getDb();
            const baseId = docs.length;
            const flatArr = new Float32Array(SAMPLE_TEXTS.length * 384);
            const ids = new Uint32Array(SAMPLE_TEXTS.length);
            for (let i = 0; i < SAMPLE_TEXTS.length; i++) {
                flatArr.set(vecs[i], i * 384);
                ids[i] = baseId + i;
                docs.push(SAMPLE_TEXTS[i]);
                embeddings.push(vecs[i]);
            }
            await instance.insert_vectors(flatArr, ids, 384);
            setStatus(storeStatus, '✅ 10 samples embedded and stored', 'ok');
            refreshDocs();
        } catch (e: any) {
            setStatus(storeStatus, `❌ ${e.message}`, 'err');
        } finally { samplesBtn.disabled = false; }
    });

    clearBtn.addEventListener('click', async () => {
        try {
            const instance = await getDb();
            await instance.clear();
            db = null;
            docs.length = 0;
            embeddings.length = 0;
            refreshDocs();
            resultsList.innerHTML = '';
            setStatus(storeStatus, '✅ Cleared', 'ok');
        } catch (e: any) { setStatus(storeStatus, `❌ ${e.message}`, 'err'); }
    });

    searchBtn.addEventListener('click', async () => {
        const query = queryInput.value.trim();
        if (!query) return;
        try {
            searchBtn.disabled = true;
            setStatus(searchStatus, '⏳ Embedding query…', '');
            resultsList.innerHTML = '';
            const [queryVec] = await embedTexts([query]);
            const instance = await getDb();
            setStatus(searchStatus, '🔍 Searching…', '');
            const raw = await instance.search_vector(queryVec, 5);
            const results: Array<{ id: number; score: number }> =
                typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!results?.length) {
                setStatus(searchStatus, 'No results. Store some documents first.', '');
                return;
            }
            setStatus(searchStatus, `${results.length} result(s) for "${query}"`, 'ok');
            results.forEach((r, i) => {
                const item = el('div', 'list-item');
                item.innerHTML = `
          <span class="rank-badge">#${i + 1}</span>
          <span class="item-text">${escHtml(docs[r.id] ?? `[id:${r.id}]`)}</span>
          <span class="score-badge">${(r.score * 100).toFixed(1)}%</span>
        `;
                resultsList.appendChild(item);
            });
        } catch (e: any) {
            setStatus(searchStatus, `❌ ${e.message}`, 'err');
        } finally { searchBtn.disabled = false; }
    });

    input.addEventListener('keydown', e => { if (e.key === 'Enter') storeBtn.click(); });
    queryInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchBtn.click(); });
    refreshDocs();
}

function escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
