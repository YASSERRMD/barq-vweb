import { getWasm, makeDB, el, setStatus } from './shared';

export function mountPersistenceDemo(root: HTMLElement) {
    root.innerHTML = `
    <div class="card">
      <div class="card-title">💾 Persistence (save → reload)</div>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:1rem">
        Insert documents, save the index to OPFS, then <strong>reload the page</strong>
        and click <strong>Load</strong> to restore all data without re-inserting.
      </p>
      <div class="input-row">
        <input type="text" id="pd-input" placeholder="Enter text to store..." />
        <button class="btn" id="pd-store">Store</button>
      </div>
      <p class="status" id="pd-store-status"></p>
      <div class="count-pill" id="pd-count">0 stored in session</div>

      <div style="display:flex;gap:.65rem;margin-top:.8rem;flex-wrap:wrap">
        <button class="btn" id="pd-save">💾 Save to OPFS</button>
        <button class="btn btn-sm" id="pd-load">📂 Load from OPFS</button>
        <button class="btn btn-sm" id="pd-clear">🗑 Clear</button>
      </div>
      <p class="status" id="pd-persist-status"></p>
    </div>

    <div class="card">
      <div class="card-title">🔍 Search after reload</div>
      <div class="input-row">
        <input type="text" id="pd-query" placeholder="Search restored documents..." />
        <button class="btn" id="pd-search">Search</button>
      </div>
      <p class="status" id="pd-search-status"></p>
      <div id="pd-results" class="list"></div>
    </div>

    <div class="card">
      <div class="card-title">📚 Session documents</div>
      <div id="pd-docs" class="list"></div>
    </div>
  `;

    const storeInput = root.querySelector<HTMLInputElement>('#pd-input')!;
    const storeBtn = root.querySelector<HTMLButtonElement>('#pd-store')!;
    const saveBtn = root.querySelector<HTMLButtonElement>('#pd-save')!;
    const loadBtn = root.querySelector<HTMLButtonElement>('#pd-load')!;
    const clearBtn = root.querySelector<HTMLButtonElement>('#pd-clear')!;
    const queryInput = root.querySelector<HTMLInputElement>('#pd-query')!;
    const searchBtn = root.querySelector<HTMLButtonElement>('#pd-search')!;
    const storeStatus = root.querySelector<HTMLElement>('#pd-store-status')!;
    const persistStatus = root.querySelector<HTMLElement>('#pd-persist-status')!;
    const searchStatus = root.querySelector<HTMLElement>('#pd-search-status')!;
    const resultsList = root.querySelector<HTMLElement>('#pd-results')!;
    const docsList = root.querySelector<HTMLElement>('#pd-docs')!;
    const countPill = root.querySelector<HTMLElement>('#pd-count')!;

    let db: any = null;
    let docs: string[] = [];

    async function getDb() {
        if (db) return db;
        const mod = await getWasm();
        db = makeDB(mod, 'persist-demo');
        return db;
    }

    function refreshDocs() {
        docsList.innerHTML = '';
        docs.slice(-15).reverse().forEach(t => {
            const item = el('div', 'list-item');
            item.innerHTML = `<span class="item-text">${escHtml(t)}</span>`;
            docsList.appendChild(item);
        });
        countPill.textContent = `${docs.length} stored in session`;
    }

    storeBtn.addEventListener('click', async () => {
        const text = storeInput.value.trim();
        if (!text) return;
        try {
            storeBtn.disabled = true;
            const instance = await getDb();
            docs.push(text);
            await instance.insert_texts([text], []);
            storeInput.value = '';
            setStatus(storeStatus, `✅ Stored: "${text.slice(0, 50)}"`, 'ok');
            refreshDocs();
        } catch (e: any) {
            setStatus(storeStatus, `❌ ${e.message}`, 'err');
        } finally { storeBtn.disabled = false; }
    });

    saveBtn.addEventListener('click', async () => {
        try {
            saveBtn.disabled = true;
            setStatus(persistStatus, '⏳ Saving...', '');
            const instance = await getDb();
            const result = await instance.save();
            setStatus(persistStatus, `✅ Saved to OPFS: "${result}"`, 'ok');
        } catch (e: any) {
            setStatus(persistStatus, `❌ ${e.message}`, 'err');
        } finally { saveBtn.disabled = false; }
    });

    loadBtn.addEventListener('click', async () => {
        try {
            loadBtn.disabled = true;
            setStatus(persistStatus, '⏳ Loading from OPFS...', '');
            const instance = await getDb();
            const result = await instance.load();
            setStatus(persistStatus, `✅ Loaded: "${result}"`, 'ok');
        } catch (e: any) {
            setStatus(persistStatus, `❌ ${e.message}`, 'err');
        } finally { loadBtn.disabled = false; }
    });

    clearBtn.addEventListener('click', async () => {
        try {
            const instance = await getDb();
            await instance.clear();
            db = null;
            docs = [];
            refreshDocs();
            resultsList.innerHTML = '';
            setStatus(persistStatus, '✅ Cleared', 'ok');
        } catch (e: any) { setStatus(persistStatus, `❌ ${e.message}`, 'err'); }
    });

    searchBtn.addEventListener('click', async () => {
        const query = queryInput.value.trim();
        if (!query) return;
        try {
            searchBtn.disabled = true;
            setStatus(searchStatus, '🔍 Searching...', '');
            resultsList.innerHTML = '';
            const instance = await getDb();
            const raw = await instance.search(query, 5, false);
            const results: Array<{ id: number; score: number }> = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!results?.length) {
                setStatus(searchStatus, 'No results — store and save documents first.', '');
                return;
            }
            setStatus(searchStatus, `${results.length} result(s)`, 'ok');
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

    storeInput.addEventListener('keydown', e => { if (e.key === 'Enter') storeBtn.click(); });
    queryInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchBtn.click(); });

    refreshDocs();
}

function escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
