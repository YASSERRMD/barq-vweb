import { getWasm, makeDB, el, setStatus } from './shared';

const DIM = 8;

function randomVec(dim: number): Float32Array {
    const v = new Float32Array(dim);
    let norm = 0;
    for (let i = 0; i < dim; i++) { v[i] = (Math.random() * 2 - 1); norm += v[i] * v[i]; }
    norm = Math.sqrt(norm);
    for (let i = 0; i < dim; i++) v[i] /= norm;
    return v;
}

function lerp(a: Float32Array, b: Float32Array, t: number): Float32Array {
    const v = new Float32Array(a.length);
    let norm = 0;
    for (let i = 0; i < a.length; i++) { v[i] = a[i] * (1 - t) + b[i] * t; norm += v[i] * v[i]; }
    norm = Math.sqrt(norm);
    for (let i = 0; i < a.length; i++) v[i] /= norm;
    return v;
}

export function mountVectorDemo(root: HTMLElement) {
    root.innerHTML = `
    <div class="card">
      <div class="card-title">🎲 Vector Generator</div>
      <div class="input-row">
        <input type="text" id="vd-count" placeholder="How many vectors?" value="50" style="max-width:140px"/>
        <button class="btn" id="vd-generate">Generate &amp; Insert</button>
        <button class="btn btn-sm" id="vd-clear">Clear</button>
      </div>
      <p class="status" id="vd-gen-status"></p>
      <div class="count-pill" id="vd-count-pill">0 vectors indexed</div>
    </div>

    <div class="card">
      <div class="card-title">🔍 kNN Search (vector)</div>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.8rem">
        Click <strong>Generate Query</strong> to create a random query vector and find its neighbours.
      </p>
      <div class="input-row">
        <button class="btn" id="vd-query">Generate Query &amp; Search</button>
        <input type="text" id="vd-topk" placeholder="k" value="5" style="max-width:70px"/>
      </div>
      <div class="vec-preview" id="vd-query-preview">—</div>
      <p class="status" id="vd-search-status"></p>
      <div id="vd-results" class="list"></div>
    </div>
  `;

    const countInput = root.querySelector<HTMLInputElement>('#vd-count')!;
    const genBtn = root.querySelector<HTMLButtonElement>('#vd-generate')!;
    const clearBtn = root.querySelector<HTMLButtonElement>('#vd-clear')!;
    const queryBtn = root.querySelector<HTMLButtonElement>('#vd-query')!;
    const topkInput = root.querySelector<HTMLInputElement>('#vd-topk')!;
    const genStatus = root.querySelector<HTMLElement>('#vd-gen-status')!;
    const searchStatus = root.querySelector<HTMLElement>('#vd-search-status')!;
    const resultsList = root.querySelector<HTMLElement>('#vd-results')!;
    const countPill = root.querySelector<HTMLElement>('#vd-count-pill')!;
    const queryPreview = root.querySelector<HTMLElement>('#vd-query-preview')!;

    let db: any = null;
    let stored: Array<{ id: number; vec: Float32Array }> = [];

    async function getDb() {
        if (db) return db;
        const mod = await getWasm();
        db = makeDB(mod, 'vector-demo');
        return db;
    }

    genBtn.addEventListener('click', async () => {
        const n = Math.min(Math.max(parseInt(countInput.value) || 50, 1), 500);
        try {
            genBtn.disabled = true;
            setStatus(genStatus, `⏳ Inserting ${n} vectors...`, '');
            const instance = await getDb();

            const flatArr = new Float32Array(n * DIM);
            const ids = new Uint32Array(n);
            for (let i = 0; i < n; i++) {
                const v = randomVec(DIM);
                flatArr.set(v, i * DIM);
                ids[i] = stored.length + i;
                stored.push({ id: stored.length + i, vec: v });
            }
            await instance.insert_vectors(flatArr, ids, DIM);
            countPill.textContent = `${stored.length} vectors indexed`;
            setStatus(genStatus, `✅ ${n} vectors inserted (dim=${DIM})`, 'ok');
        } catch (e: any) {
            setStatus(genStatus, `❌ ${e.message}`, 'err');
        } finally { genBtn.disabled = false; }
    });

    clearBtn.addEventListener('click', async () => {
        try {
            const instance = await getDb();
            await instance.clear();
            db = null;
            stored = [];
            resultsList.innerHTML = '';
            queryPreview.textContent = '—';
            countPill.textContent = '0 vectors indexed';
            setStatus(genStatus, '✅ Cleared', 'ok');
        } catch (e: any) { setStatus(genStatus, `❌ ${e.message}`, 'err'); }
    });

    queryBtn.addEventListener('click', async () => {
        const k = Math.min(Math.max(parseInt(topkInput.value) || 5, 1), 20);
        try {
            queryBtn.disabled = true;
            setStatus(searchStatus, '🔍 Searching...', '');
            resultsList.innerHTML = '';

            const query = randomVec(DIM);
            queryPreview.textContent = `[${Array.from(query).map(x => x.toFixed(3)).join(', ')}]`;

            const instance = await getDb();
            const raw = await instance.search_vector(query, k);
            const results: Array<{ id: number; score: number }> = typeof raw === 'string' ? JSON.parse(raw) : raw;

            if (!results?.length) {
                setStatus(searchStatus, 'No results — insert vectors first.', '');
                return;
            }
            setStatus(searchStatus, `Top-${results.length} neighbours found`, 'ok');
            results.forEach((r, i) => {
                const item = el('div', 'list-item');
                const storedVec = stored.find(s => s.id === r.id);
                item.innerHTML = `
          <span class="rank-badge">#${i + 1}</span>
          <span class="item-text" style="font-family:monospace;font-size:.78rem">
            id:${r.id} [${storedVec ? Array.from(storedVec.vec).map(x => x.toFixed(2)).join(', ') : '…'}]
          </span>
          <span class="score-badge">${(r.score * 100).toFixed(2)}%</span>
        `;
                resultsList.appendChild(item);
            });
        } catch (e: any) {
            setStatus(searchStatus, `❌ ${e.message}`, 'err');
        } finally { queryBtn.disabled = false; }
    });
}
