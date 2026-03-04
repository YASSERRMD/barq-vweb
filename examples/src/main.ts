import './style.css';
import { getWasm, loadEmbedder, loadBarqWasm, backendLabel } from './shared';
import { mountTextDemo } from './text-demo';
import { mountVectorDemo } from './vector-demo';
import { mountHybridDemo } from './hybrid-demo';
import { mountPersistenceDemo } from './persistence-demo';

// ── Tab routing ──────────────────────────────────────────────
const tabs = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
const sections = document.querySelectorAll<HTMLElement>('.tab');

tabs.forEach(btn => {
    btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(`tab-${btn.dataset.tab}`);
        target?.classList.add('active');
    });
});

// ── Startup init: WASM + barq-wasm + embedder ────────────────
const badgeTxt = document.getElementById('backend-txt')!;
const badgePill = document.getElementById('backend-pill')!;

async function startup() {
    // 1. Load barq-vweb WASM
    badgeTxt.textContent = 'Loading WASM…';
    await getWasm();

    // 2. Try barq-wasm SIMD kernels (non-blocking — won't crash if absent)
    await loadBarqWasm();

    // 3. Load MiniLM-L6-v2 int8 with progress
    badgeTxt.textContent = 'Downloading model (0%)…';
    await loadEmbedder((pct) => {
        badgeTxt.textContent = `Downloading model (${pct}%)…`;
    });

    // 4. Update badge
    const label = backendLabel();
    badgeTxt.textContent = label;
    badgePill.style.borderColor = label.includes('SIMD') ? '#f59e0b' : '#10b981';
    const dot = badgePill.querySelector<HTMLElement>('.dot');
    if (dot) dot.style.background = label.includes('SIMD') ? '#f59e0b' : '#10b981';
}

// Mount demos immediately (they show "loading…" until ready)
mountTextDemo(document.getElementById('tab-text')!);
mountVectorDemo(document.getElementById('tab-vector')!);
mountHybridDemo(document.getElementById('tab-hybrid')!);
mountPersistenceDemo(document.getElementById('tab-persistence')!);

// Kick off startup (non-blocking for tab render)
startup().catch(e => {
    badgeTxt.textContent = 'Init error';
    console.error('[barq-vweb] startup error:', e);
});
