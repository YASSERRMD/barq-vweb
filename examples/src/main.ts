import './style.css';
import { getWasm } from './shared';
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

// ── Backend badge ────────────────────────────────────────────
async function initBackendBadge() {
    const el = document.getElementById('backend-txt')!;
    try {
        const { BarqVWeb } = await getWasm();
        const db = new BarqVWeb('_probe', undefined);
        el.textContent = (db as any).backend_info?.() ?? 'WASM/Scalar';
        document.getElementById('backend-pill')!.style.borderColor = '#10b981';
    } catch (e) {
        el.textContent = 'Init failed';
        document.getElementById('backend-pill')!.style.borderColor = '#ef4444';
    }
}

// ── Mount all demos ──────────────────────────────────────────
initBackendBadge();
mountTextDemo(document.getElementById('tab-text')!);
mountVectorDemo(document.getElementById('tab-vector')!);
mountHybridDemo(document.getElementById('tab-hybrid')!);
mountPersistenceDemo(document.getElementById('tab-persistence')!);
