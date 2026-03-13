import { getWasm, makeDB, embedTexts, el, setStatus } from './shared';

const CORPUS = [
  { id: 0, text: 'Rust is a systems programming language focused on safety and speed.' },
  { id: 1, text: 'Python is popular in data science and machine learning communities.' },
  { id: 2, text: 'JavaScript runs natively in the browser and on Node.js.' },
  { id: 3, text: 'WebAssembly enables near-native performance in browsers.' },
  { id: 4, text: 'Vector search finds semantically similar documents efficiently.' },
  { id: 5, text: 'HNSW is a graph-based ANN index with sub-linear query time.' },
  { id: 6, text: 'BM25 is a classic text ranking algorithm used in search engines.' },
  { id: 7, text: 'Cosine similarity computes the angle between two embedding vectors.' },
  { id: 8, text: 'Hybrid search combines dense vector retrieval with sparse keyword search.' },
  { id: 9, text: 'Product quantization compresses high-dimensional vectors into compact codes.' },
];

export function mountHybridDemo(root: HTMLElement) {
  root.innerHTML = `
    <div class="card">
      <div class="card-title">📦 Corpus</div>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.8rem">
        10 pre-loaded documents. Click <strong>Index Corpus</strong> to embed all with MiniLM then search.
      </p>
      <div class="input-row">
        <button class="btn" id="hd-index">Index Corpus</button>
        <button class="btn btn-sm" id="hd-clear">Clear</button>
      </div>
      <p class="status" id="hd-index-status"></p>
      <div class="list" id="hd-corpus">
        ${CORPUS.map(d => `<div class="list-item"><span class="rank-badge">#${d.id}</span><span class="item-text">${d.text}</span></div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔀 Hybrid Search (BM25 + MiniLM Vectors + RRF)</div>
      <div class="input-row">
        <input type="text" id="hd-query" placeholder="Type a query…" />
        <button class="btn" id="hd-search">Search</button>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="hd-hybrid" checked/>
        <label for="hd-hybrid">Hybrid mode (BM25 + vector RRF)</label>
      </div>
      <p class="status" id="hd-search-status"></p>
      <div id="hd-results" class="list"></div>
    </div>
  `;

  const indexBtn = root.querySelector<HTMLButtonElement>('#hd-index')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('#hd-clear')!;
  const queryInput = root.querySelector<HTMLInputElement>('#hd-query')!;
  const searchBtn = root.querySelector<HTMLButtonElement>('#hd-search')!;
  const hybridCheck = root.querySelector<HTMLInputElement>('#hd-hybrid')!;
  const indexStatus = root.querySelector<HTMLElement>('#hd-index-status')!;
  const searchStatus = root.querySelector<HTMLElement>('#hd-search-status')!;
  const resultsList = root.querySelector<HTMLElement>('#hd-results')!;

  let db: any = null;

  async function getDb() {
    if (db) return db;
    const mod = await getWasm();
    db = makeDB(mod, 'hybrid-demo');
    return db;
  }

  indexBtn.addEventListener('click', async () => {
    try {
      indexBtn.disabled = true;
      setStatus(indexStatus, '⏳ Embedding corpus with MiniLM-L6-v2…', '');
      const texts = CORPUS.map(d => d.text);
      const vecs = await embedTexts(texts);
      const instance = await getDb();
      const flatArr = new Float32Array(texts.length * 384);
      const ids = new Uint32Array(texts.length);
      for (let i = 0; i < texts.length; i++) {
        flatArr.set(vecs[i], i * 384);
        ids[i] = CORPUS[i].id;
      }
      await instance.insert_vectors(flatArr, ids, 384);
      setStatus(indexStatus, `✅ ${CORPUS.length} documents embedded and indexed`, 'ok');
    } catch (e: any) {
      setStatus(indexStatus, `❌ ${e.message}`, 'err');
    } finally { indexBtn.disabled = false; }
  });

  clearBtn.addEventListener('click', async () => {
    try {
      const instance = await getDb();
      await instance.clear();
      db = null;
      resultsList.innerHTML = '';
      setStatus(indexStatus, '✅ Cleared', 'ok');
    } catch (e: any) { setStatus(indexStatus, `❌ ${e.message}`, 'err'); }
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
      setStatus(searchStatus, `🔍 Searching (${hybridCheck.checked ? 'hybrid' : 'vector only'})…`, '');
      const raw = await instance.search_vector(queryVec, 5);
      const results: Array<{ id: number; score: number }> =
        typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!results?.length) {
        setStatus(searchStatus, 'No results — index corpus first.', '');
        return;
      }
      setStatus(searchStatus, `Top-${results.length} results`, 'ok');
      results.forEach((r, i) => {
        const doc = CORPUS.find(d => d.id === r.id) ?? { text: `[id:${r.id}]` };
        const item = el('div', 'list-item');
        item.innerHTML = `
          <span class="rank-badge">#${i + 1}</span>
          <span class="item-text">${doc.text}</span>
          <span class="score-badge">${(r.score * 100).toFixed(2)}%</span>
        `;
        resultsList.appendChild(item);
      });
    } catch (e: any) {
      setStatus(searchStatus, `❌ ${e.message}`, 'err');
    } finally { searchBtn.disabled = false; }
  });

  queryInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchBtn.click(); });
}
