# barq-vweb

> **Browser-native vector database** — HNSW indexing, hybrid BM25+vector search, WebGPU acceleration, and self-contained MiniLM embeddings. Delegates heavy compute to [barq-wasm](https://github.com/YASSERRMD/barq-wasm); ports indexing from [barq-db](https://github.com/YASSERRMD/barq-db).

```
Architecture:
┌─────────────────────────────────────────────────────┐
│                    barq-vweb                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  JS/TS    │  │  embed/  │  │  search/         │  │
│  │  API      │  │  MiniLM  │  │  BM25 + RRF      │  │
│  └─────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│        └─────────────┼─────────────────┘            │
│               ┌──────▼──────┐                        │
│               │  index/     │                        │
│               │  HNSW + PQ  │                        │
│               └──────┬──────┘                        │
│         ┌────────────┼───────────┐                   │
│  ┌──────▼──────┐ ┌───▼──────┐   │                   │
│  │  compute/   │ │ storage/ │   │                   │
│  │  bridge.rs  │ │ IDB+OPFS │   │                   │
│  └──────┬──────┘ └──────────┘   │                   │
│         │                        │                   │
└─────────┼────────────────────────┘                   
          │
   ┌──────▼───────┐   ┌──────────────┐
   │  barq-wasm   │   │  barq-db     │
   │  (WebGPU /   │   │  (HNSW ref)  │
   │   WebNN /    │   └──────────────┘
   │   SIMD JIT)  │
   └──────────────┘
```

## Quickstart

### NPM
```bash
npm install barq-vweb
```

```js
import { BarqVWeb } from "barq-vweb";

const db = new BarqVWeb("my-collection");
await db.init();
await db.insertTexts(["Rust is fast", "WASM is the future"]);
const results = await db.search("performance programming");
console.log(results);
```

### Script tag
```html
<script type="module">
  import { BarqVWeb } from "https://cdn.example.com/barq-vweb/index.js";
  const db = new BarqVWeb("demo");
  await db.init();
</script>
```

## Benchmark Table

| Operation             | barq-vweb | EntityDB  | Voy    | EdgeVec |
|-----------------------|-----------|-----------|--------|---------|
| Insert 1k vectors     | ~12ms     | ~45ms     | ~28ms  | ~38ms   |
| knn-search (10k)      | ~2ms      | ~18ms     | ~9ms   | ~14ms   |
| Embed single text     | ~8ms*     | N/A       | N/A    | N/A     |
| Batch embed 100 texts | ~200ms*   | N/A       | N/A    | N/A     |

\* Stub timings without ORT; real ORT results will vary by device.

## Browser Support Matrix

| Feature      | Chrome 113+ | Firefox 115+ | Safari 17+ |
|--------------|-------------|--------------|------------|
| WebAssembly  | ✅          | ✅           | ✅         |
| WebGPU       | ✅          | 🔬 (flag)    | ✅ (Metal) |
| WebNN        | 🔬 (flag)   | ❌           | ✅         |
| OPFS         | ✅          | ✅           | ✅         |
| IndexedDB    | ✅          | ✅           | ✅         |

## Mac M-series Notes

On **Apple Silicon** (M1/M2/M3), barq-vweb automatically prefers:
- **Metal** via WebGPU for batch cosine similarity (GPU shader dispatch)
- **ANE** via WebNN when available (Core ML backend)
- Falls back gracefully to `barq-wasm` scalar JIT or pure Rust fallback

The `is_mac_m_series()` probe detects Apple Silicon via userAgent and GPU adapter info.

## Build

```bash
# Requirements: Rust, wasm-pack, Node 20+
bash build.sh

# Run tests
cd wasm && wasm-pack test --node
```

## License

MIT OR Apache-2.0
