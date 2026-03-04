(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const d of s)if(d.type==="childList")for(const c of d.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const d={};return s.integrity&&(d.integrity=s.integrity),s.referrerPolicy&&(d.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?d.credentials="include":s.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function r(s){if(s.ep)return;s.ep=!0;const d=n(s);fetch(s.href,d)}})();class G{__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,K.unregister(this),e}free(){const e=this.__destroy_into_raw();i.__wbg_barqvweb_free(e,0)}backend_info(){let e,n;try{const r=i.barqvweb_backend_info(this.__wbg_ptr);return e=r[0],n=r[1],N(r[0],r[1])}finally{i.__wbindgen_free(e,n,1)}}clear(){return i.barqvweb_clear(this.__wbg_ptr)}count(){return i.barqvweb_count(this.__wbg_ptr)>>>0}delete(e){return i.barqvweb_delete(this.__wbg_ptr,e)}insert_texts(e,n){return i.barqvweb_insert_texts(this.__wbg_ptr,e,n)}insert_vectors(e,n,r){return i.barqvweb_insert_vectors(this.__wbg_ptr,e,n,r)}load(){return i.barqvweb_load(this.__wbg_ptr)}constructor(e,n){const r=H(e,i.__wbindgen_malloc,i.__wbindgen_realloc),s=M;var d=E(n)?0:H(n,i.__wbindgen_malloc,i.__wbindgen_realloc),c=M;const l=i.barqvweb_new(r,s,d,c);return this.__wbg_ptr=l>>>0,K.register(this,this.__wbg_ptr,this),this}save(){return i.barqvweb_save(this.__wbg_ptr)}search(e,n,r){const s=H(e,i.__wbindgen_malloc,i.__wbindgen_realloc),d=M;return i.barqvweb_search(this.__wbg_ptr,s,d,n,r)}search_vector(e,n){return i.barqvweb_search_vector(this.__wbg_ptr,e,n)}}Symbol.dispose&&(G.prototype[Symbol.dispose]=G.prototype.free);function se(){return{__proto__:null,"./barq_vweb_bg.js":{__proto__:null,__wbg___wbindgen_is_function_3c846841762788c1:function(e){return typeof e=="function"},__wbg___wbindgen_is_object_781bc9f159099513:function(e){const n=e;return typeof n=="object"&&n!==null},__wbg___wbindgen_is_string_7ef6b97b02428fae:function(e){return typeof e=="string"},__wbg___wbindgen_is_undefined_52709e72fb9f179c:function(e){return e===void 0},__wbg___wbindgen_number_get_34bb9d9dcfa21373:function(e,n){const r=n,s=typeof r=="number"?r:void 0;A().setFloat64(e+8,E(s)?0:s,!0),A().setInt32(e+0,!E(s),!0)},__wbg___wbindgen_string_get_395e606bd0ee4427:function(e,n){const r=n,s=typeof r=="string"?r:void 0;var d=E(s)?0:H(s,i.__wbindgen_malloc,i.__wbindgen_realloc),c=M;A().setInt32(e+4,c,!0),A().setInt32(e+0,d,!0)},__wbg___wbindgen_throw_6ddd609b62940d55:function(e,n){throw new Error(N(e,n))},__wbg__wbg_cb_unref_6b5b6b8576d35cb1:function(e){e._wbg_cb_unref()},__wbg_apply_d7728efbea08f95e:function(){return L(function(e,n,r){return Reflect.apply(e,n,r)},arguments)},__wbg_call_2d781c1f4d5c0ef8:function(){return L(function(e,n,r){return e.call(n,r)},arguments)},__wbg_call_dcc2662fa17a72cf:function(){return L(function(e,n,r,s){return e.call(n,r,s)},arguments)},__wbg_crypto_38df2bab126b63dc:function(e){return e.crypto},__wbg_error_a6fa202b58aa1cd3:function(e,n){let r,s;try{r=e,s=n,console.error(N(e,n))}finally{i.__wbindgen_free(r,s,1)}},__wbg_getRandomValues_c44a50d8cfdaebeb:function(){return L(function(e,n){e.getRandomValues(n)},arguments)},__wbg_get_3ef1eba1850ade27:function(){return L(function(e,n){return Reflect.get(e,n)},arguments)},__wbg_get_a8ee5c45dabc1b3b:function(e,n){return e[n>>>0]},__wbg_length_259ee9d041e381ad:function(e){return e.length},__wbg_length_27280eca2d70010e:function(e){return e.length},__wbg_length_b3416cf66a5452c8:function(e){return e.length},__wbg_length_ea16607d7b61445b:function(e){return e.length},__wbg_msCrypto_bd5a034af96bcba6:function(e){return e.msCrypto},__wbg_new_227d7c05414eb861:function(){return new Error},__wbg_new_5f486cdf45a04d78:function(e){return new Uint8Array(e)},__wbg_new_a70fbab9066b301f:function(){return new Array},__wbg_new_ab79df5bd7c26067:function(){return new Object},__wbg_new_from_slice_ff2c15e8e05ffdfc:function(e,n){return new Float32Array(X(e,n))},__wbg_new_typed_aaaeaf29cf802876:function(e,n){try{var r={a:e,b:n},s=(c,l)=>{const p=r.a;r.a=0;try{return ce(p,r.b,c,l)}finally{r.a=p}};return new Promise(s)}finally{r.a=r.b=0}},__wbg_new_with_length_825018a1616e9e55:function(e){return new Uint8Array(e>>>0)},__wbg_node_84ea875411254db1:function(e){return e.node},__wbg_process_44c7a14e11e9f69e:function(e){return e.process},__wbg_prototypesetcall_247ac4333d4d3cb4:function(e,n,r){Float32Array.prototype.set.call(X(e,n),r)},__wbg_prototypesetcall_d62e5099504357e6:function(e,n,r){Uint8Array.prototype.set.call(Y(e,n),r)},__wbg_prototypesetcall_f04613188bde902d:function(e,n,r){Uint32Array.prototype.set.call(ie(e,n),r)},__wbg_push_e87b0e732085a946:function(e,n){return e.push(n)},__wbg_queueMicrotask_0c399741342fb10f:function(e){return e.queueMicrotask},__wbg_queueMicrotask_a082d78ce798393e:function(e){queueMicrotask(e)},__wbg_randomFillSync_6c25eac9869eb53c:function(){return L(function(e,n){e.randomFillSync(n)},arguments)},__wbg_require_b4edbdcf3e2a1ef0:function(){return L(function(){return module.require},arguments)},__wbg_resolve_ae8d83246e5bcc12:function(e){return Promise.resolve(e)},__wbg_set_282384002438957f:function(e,n,r){e[n>>>0]=r},__wbg_set_6be42768c690e380:function(e,n,r){e[n]=r},__wbg_set_7eaa4f96924fd6b3:function(){return L(function(e,n,r){return Reflect.set(e,n,r)},arguments)},__wbg_stack_3b0d974bbf31e44f:function(e,n){const r=n.stack,s=H(r,i.__wbindgen_malloc,i.__wbindgen_realloc),d=M;A().setInt32(e+4,d,!0),A().setInt32(e+0,s,!0)},__wbg_static_accessor_GLOBAL_8adb955bd33fac2f:function(){const e=typeof global>"u"?null:global;return E(e)?0:B(e)},__wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913:function(){const e=typeof globalThis>"u"?null:globalThis;return E(e)?0:B(e)},__wbg_static_accessor_SELF_f207c857566db248:function(){const e=typeof self>"u"?null:self;return E(e)?0:B(e)},__wbg_static_accessor_WINDOW_bb9f1ba69d61b386:function(){const e=typeof window>"u"?null:window;return E(e)?0:B(e)},__wbg_subarray_a068d24e39478a8a:function(e,n,r){return e.subarray(n>>>0,r>>>0)},__wbg_then_098abe61755d12f6:function(e,n){return e.then(n)},__wbg_then_9e335f6dd892bc11:function(e,n,r){return e.then(n,r)},__wbg_versions_276b2795b1c6a219:function(e){return e.versions},__wbindgen_cast_0000000000000001:function(e,n){return le(e,n,i.wasm_bindgen__closure__destroy__h5fc7b39f71c2d967,ae)},__wbindgen_cast_0000000000000002:function(e){return e},__wbindgen_cast_0000000000000003:function(e,n){return Y(e,n)},__wbindgen_cast_0000000000000004:function(e,n){return N(e,n)},__wbindgen_init_externref_table:function(){const e=i.__wbindgen_externrefs,n=e.grow(4);e.set(0,void 0),e.set(n+0,void 0),e.set(n+1,null),e.set(n+2,!0),e.set(n+3,!1)}}}}function ae(t,e,n){const r=i.wasm_bindgen__convert__closures_____invoke__h85e564a221c428e3(t,e,n);if(r[1])throw ue(r[0])}function ce(t,e,n,r){i.wasm_bindgen__convert__closures_____invoke__h14d9ba7aff402d3a(t,e,n,r)}const K=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(t=>i.__wbg_barqvweb_free(t>>>0,1));function B(t){const e=i.__externref_table_alloc();return i.__wbindgen_externrefs.set(e,t),e}const Q=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(t=>t.dtor(t.a,t.b));function X(t,e){return t=t>>>0,oe().subarray(t/4,t/4+e)}function ie(t,e){return t=t>>>0,de().subarray(t/4,t/4+e)}function Y(t,e){return t=t>>>0,O().subarray(t/1,t/1+e)}let $=null;function A(){return($===null||$.buffer.detached===!0||$.buffer.detached===void 0&&$.buffer!==i.memory.buffer)&&($=new DataView(i.memory.buffer)),$}let C=null;function oe(){return(C===null||C.byteLength===0)&&(C=new Float32Array(i.memory.buffer)),C}function N(t,e){return t=t>>>0,be(t,e)}let I=null;function de(){return(I===null||I.byteLength===0)&&(I=new Uint32Array(i.memory.buffer)),I}let R=null;function O(){return(R===null||R.byteLength===0)&&(R=new Uint8Array(i.memory.buffer)),R}function L(t,e){try{return t.apply(this,e)}catch(n){const r=B(n);i.__wbindgen_exn_store(r)}}function E(t){return t==null}function le(t,e,n,r){const s={a:t,b:e,cnt:1,dtor:n},d=(...c)=>{s.cnt++;const l=s.a;s.a=0;try{return r(l,s.b,...c)}finally{s.a=l,d._wbg_cb_unref()}};return d._wbg_cb_unref=()=>{--s.cnt===0&&(s.dtor(s.a,s.b),s.a=0,Q.unregister(s))},Q.register(d,s,s),d}function H(t,e,n){if(n===void 0){const l=W.encode(t),p=e(l.length,1)>>>0;return O().subarray(p,p+l.length).set(l),M=l.length,p}let r=t.length,s=e(r,1)>>>0;const d=O();let c=0;for(;c<r;c++){const l=t.charCodeAt(c);if(l>127)break;d[s+c]=l}if(c!==r){c!==0&&(t=t.slice(c)),s=n(s,r,r=c+t.length*3,1)>>>0;const l=O().subarray(s+c,s+r),p=W.encodeInto(t,l);c+=p.written,s=n(s,r,c,1)>>>0}return M=c,s}function ue(t){const e=i.__wbindgen_externrefs.get(t);return i.__externref_table_dealloc(t),e}let U=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});U.decode();const _e=2146435072;let j=0;function be(t,e){return j+=e,j>=_e&&(U=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),U.decode(),j=e),U.decode(O().subarray(t,t+e))}const W=new TextEncoder;"encodeInto"in W||(W.encodeInto=function(t,e){const n=W.encode(t);return e.set(n),{read:t.length,written:n.length}});let M=0,i;function fe(t,e){return i=t.exports,$=null,C=null,I=null,R=null,i.__wbindgen_start(),i}async function pe(t,e){if(typeof Response=="function"&&t instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(t,e)}catch(s){if(t.ok&&n(t.type)&&t.headers.get("Content-Type")!=="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",s);else throw s}const r=await t.arrayBuffer();return await WebAssembly.instantiate(r,e)}else{const r=await WebAssembly.instantiate(t,e);return r instanceof WebAssembly.Instance?{instance:r,module:t}:r}function n(r){switch(r){case"basic":case"cors":case"default":return!0}return!1}}async function ye(t){if(i!==void 0)return i;t!==void 0&&(Object.getPrototypeOf(t)===Object.prototype?{module_or_path:t}=t:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),t===void 0&&(t=new URL("/assets/barq_vweb_bg-CfiKfwWu.wasm",import.meta.url));const e=se();(typeof t=="string"||typeof Request=="function"&&t instanceof Request||typeof URL=="function"&&t instanceof URL)&&(t=fetch(t));const{instance:n,module:r}=await pe(await t,e);return fe(n)}let Z=!1,z=null;async function D(){return Z||(z||(z=ye().then(()=>{Z=!0})),await z),{BarqVWeb:G}}function V(t,e){return new t.BarqVWeb(e,void 0)}function F(t,e,n){const r=document.createElement(t);return r.className=e,r}function o(t,e,n=""){t.textContent=e,t.className=`status ${n}`}const ge=["Rust is a systems programming language focused on safety and performance.","WebAssembly enables near-native speed in the browser.","barq-vweb is a browser-native vector database built on Rust and WASM.","HNSW is a graph-based algorithm for approximate nearest neighbour search.","Cosine similarity measures the angle between two vectors.","Product quantization compresses vectors by encoding subspaces.","IndexedDB stores structured data client-side in the browser.","OPFS is the Origin Private File System — a high-performance browser FS.","BM25 is a ranking function based on term frequency and document length.","Reciprocal Rank Fusion merges ranked lists from multiple retrieval methods."];function me(t){t.innerHTML=`
    <div class="card">
      <div class="card-title">📥 Add Documents</div>
      <div class="input-row">
        <input type="text" id="td-input" placeholder="Enter text to store..." />
        <button class="btn" id="td-store">Store</button>
      </div>
      <p class="status" id="td-store-status"></p>
      <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn-sm" id="td-load-samples">Load 10 samples</button>
        <button class="btn btn-sm" id="td-clear">Clear all</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔍 Semantic Search</div>
      <div class="input-row">
        <input type="text" id="td-query" placeholder="Search stored documents..." />
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
  `;const e=t.querySelector("#td-input"),n=t.querySelector("#td-store"),r=t.querySelector("#td-load-samples"),s=t.querySelector("#td-clear"),d=t.querySelector("#td-query"),c=t.querySelector("#td-search"),l=t.querySelector("#td-store-status"),p=t.querySelector("#td-search-status"),g=t.querySelector("#td-results"),v=t.querySelector("#td-docs"),_=t.querySelector("#td-count");let m=null,w=[];async function b(){if(m)return m;const u=await D();return m=V(u,"text-demo"),m}function y(){v.innerHTML="",w.slice(-20).reverse().forEach(u=>{const a=F("div","list-item");a.innerHTML=`<span class="item-text">${ee(u)}</span>`,v.appendChild(a)}),_.textContent=`${w.length} stored`}async function h(u){if(!u.trim())return;const a=await b();w.push(u),await a.insert_texts([u],[]),o(l,`✅ Stored: "${u.slice(0,50)}"`,"ok"),y()}n.addEventListener("click",async()=>{const u=e.value.trim();if(u)try{n.disabled=!0,await h(u),e.value=""}catch(a){o(l,`❌ ${a.message}`,"err")}finally{n.disabled=!1}}),r.addEventListener("click",async()=>{r.disabled=!0,o(l,"⏳ Loading 10 sample documents...","");try{for(const u of ge)await h(u);o(l,"✅ 10 samples loaded","ok")}catch(u){o(l,`❌ ${u.message}`,"err")}finally{r.disabled=!1}}),s.addEventListener("click",async()=>{try{await(await b()).clear(),m=null,w=[],y(),g.innerHTML="",o(l,"✅ Cleared","ok")}catch(u){o(l,`❌ ${u.message}`,"err")}}),c.addEventListener("click",async()=>{const u=d.value.trim();if(u)try{c.disabled=!0,o(p,"🔍 Searching...",""),g.innerHTML="";const f=await(await b()).search(u,5,!1),S=typeof f=="string"?JSON.parse(f):f;if(!S||!S.length){o(p,"No results. Store some documents first.","");return}o(p,`${S.length} result(s) for "${u}"`,"ok"),S.forEach((x,q)=>{const k=F("div","list-item");k.innerHTML=`
          <span class="rank-badge">#${q+1}</span>
          <span class="item-text">${ee(w[x.id]??`[id:${x.id}]`)}</span>
          <span class="score-badge">${(x.score*100).toFixed(1)}%</span>
        `,g.appendChild(k)})}catch(a){o(p,`❌ ${a.message}`,"err")}finally{c.disabled=!1}}),e.addEventListener("keydown",u=>{u.key==="Enter"&&n.click()}),d.addEventListener("keydown",u=>{u.key==="Enter"&&c.click()}),y()}function ee(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const T=8;function te(t){const e=new Float32Array(t);let n=0;for(let r=0;r<t;r++)e[r]=Math.random()*2-1,n+=e[r]*e[r];n=Math.sqrt(n);for(let r=0;r<t;r++)e[r]/=n;return e}function we(t){t.innerHTML=`
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
  `;const e=t.querySelector("#vd-count"),n=t.querySelector("#vd-generate"),r=t.querySelector("#vd-clear"),s=t.querySelector("#vd-query"),d=t.querySelector("#vd-topk"),c=t.querySelector("#vd-gen-status"),l=t.querySelector("#vd-search-status"),p=t.querySelector("#vd-results"),g=t.querySelector("#vd-count-pill"),v=t.querySelector("#vd-query-preview");let _=null,m=[];async function w(){if(_)return _;const b=await D();return _=V(b,"vector-demo"),_}n.addEventListener("click",async()=>{const b=Math.min(Math.max(parseInt(e.value)||50,1),500);try{n.disabled=!0,o(c,`⏳ Inserting ${b} vectors...`,"");const y=await w(),h=new Float32Array(b*T),u=new Uint32Array(b);for(let a=0;a<b;a++){const f=te(T);h.set(f,a*T),u[a]=m.length+a,m.push({id:m.length+a,vec:f})}await y.insert_vectors(h,u,T),g.textContent=`${m.length} vectors indexed`,o(c,`✅ ${b} vectors inserted (dim=${T})`,"ok")}catch(y){o(c,`❌ ${y.message}`,"err")}finally{n.disabled=!1}}),r.addEventListener("click",async()=>{try{await(await w()).clear(),_=null,m=[],p.innerHTML="",v.textContent="—",g.textContent="0 vectors indexed",o(c,"✅ Cleared","ok")}catch(b){o(c,`❌ ${b.message}`,"err")}}),s.addEventListener("click",async()=>{const b=Math.min(Math.max(parseInt(d.value)||5,1),20);try{s.disabled=!0,o(l,"🔍 Searching...",""),p.innerHTML="";const y=te(T);v.textContent=`[${Array.from(y).map(f=>f.toFixed(3)).join(", ")}]`;const u=await(await w()).search_vector(y,b),a=typeof u=="string"?JSON.parse(u):u;if(!a?.length){o(l,"No results — insert vectors first.","");return}o(l,`Top-${a.length} neighbours found`,"ok"),a.forEach((f,S)=>{const x=F("div","list-item"),q=m.find(k=>k.id===f.id);x.innerHTML=`
          <span class="rank-badge">#${S+1}</span>
          <span class="item-text" style="font-family:monospace;font-size:.78rem">
            id:${f.id} [${q?Array.from(q.vec).map(k=>k.toFixed(2)).join(", "):"…"}]
          </span>
          <span class="score-badge">${(f.score*100).toFixed(2)}%</span>
        `,p.appendChild(x)})}catch(y){o(l,`❌ ${y.message}`,"err")}finally{s.disabled=!1}})}const P=[{id:0,text:"Rust is a systems programming language focused on safety and speed."},{id:1,text:"Python is popular in data science and machine learning communities."},{id:2,text:"JavaScript runs natively in the browser and on Node.js."},{id:3,text:"WebAssembly enables near-native performance in browsers."},{id:4,text:"Vector search finds semantically similar documents efficiently."},{id:5,text:"HNSW is a graph-based ANN index with sub-linear query time."},{id:6,text:"BM25 is a classic text ranking algorithm used in search engines."},{id:7,text:"Cosine similarity computes the angle between two embedding vectors."},{id:8,text:"Hybrid search combines dense vector retrieval with sparse keyword search."},{id:9,text:"Product quantization compresses high-dimensional vectors into compact codes."}];function ve(t){t.innerHTML=`
    <div class="card">
      <div class="card-title">📦 Corpus</div>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.8rem">
        10 pre-loaded documents. Click <strong>Index Corpus</strong> then search.
      </p>
      <div class="input-row">
        <button class="btn" id="hd-index">Index Corpus</button>
        <button class="btn btn-sm" id="hd-clear">Clear</button>
      </div>
      <p class="status" id="hd-index-status"></p>
      <div class="list" id="hd-corpus">
        ${P.map(_=>`<div class="list-item"><span class="rank-badge">#${_.id}</span><span class="item-text">${_.text}</span></div>`).join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔀 Hybrid Search (BM25 + Vector RRF)</div>
      <div class="input-row">
        <input type="text" id="hd-query" placeholder="Type a query..." />
        <button class="btn" id="hd-search">Search</button>
      </div>
      <div class="toggle-row">
        <input type="checkbox" id="hd-hybrid" checked/>
        <label for="hd-hybrid">Enable hybrid (BM25 + vector RRF)</label>
      </div>
      <p class="status" id="hd-search-status"></p>
      <div id="hd-results" class="list"></div>
    </div>
  `;const e=t.querySelector("#hd-index"),n=t.querySelector("#hd-clear"),r=t.querySelector("#hd-query"),s=t.querySelector("#hd-search"),d=t.querySelector("#hd-hybrid"),c=t.querySelector("#hd-index-status"),l=t.querySelector("#hd-search-status"),p=t.querySelector("#hd-results");let g=null;async function v(){if(g)return g;const _=await D();return g=V(_,"hybrid-demo"),g}e.addEventListener("click",async()=>{try{e.disabled=!0,o(c,"⏳ Indexing corpus...",""),await(await v()).insert_texts(P.map(m=>m.text),[]),o(c,`✅ ${P.length} documents indexed`,"ok")}catch(_){o(c,`❌ ${_.message}`,"err")}finally{e.disabled=!1}}),n.addEventListener("click",async()=>{try{await(await v()).clear(),g=null,p.innerHTML="",o(c,"✅ Cleared","ok")}catch(_){o(c,`❌ ${_.message}`,"err")}}),s.addEventListener("click",async()=>{const _=r.value.trim();if(_)try{s.disabled=!0,o(l,`🔍 Searching${d.checked?" (hybrid)":""}...`,""),p.innerHTML="";const w=await(await v()).search(_,5,d.checked),b=typeof w=="string"?JSON.parse(w):w;if(!b?.length){o(l,"No results — index corpus first.","");return}o(l,`Top-${b.length} results${d.checked?" (hybrid RRF)":" (vector only)"}`,"ok"),b.forEach((y,h)=>{const u=P[y.id]??{text:`[id:${y.id}]`},a=F("div","list-item");a.innerHTML=`
          <span class="rank-badge">#${h+1}</span>
          <span class="item-text">${u.text}</span>
          <span class="score-badge">${(y.score*100).toFixed(2)}%</span>
        `,p.appendChild(a)})}catch(m){o(l,`❌ ${m.message}`,"err")}finally{s.disabled=!1}}),r.addEventListener("keydown",_=>{_.key==="Enter"&&s.click()})}function he(t){t.innerHTML=`
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
  `;const e=t.querySelector("#pd-input"),n=t.querySelector("#pd-store"),r=t.querySelector("#pd-save"),s=t.querySelector("#pd-load"),d=t.querySelector("#pd-clear"),c=t.querySelector("#pd-query"),l=t.querySelector("#pd-search"),p=t.querySelector("#pd-store-status"),g=t.querySelector("#pd-persist-status"),v=t.querySelector("#pd-search-status"),_=t.querySelector("#pd-results"),m=t.querySelector("#pd-docs"),w=t.querySelector("#pd-count");let b=null,y=[];async function h(){if(b)return b;const a=await D();return b=V(a,"persist-demo"),b}function u(){m.innerHTML="",y.slice(-15).reverse().forEach(a=>{const f=F("div","list-item");f.innerHTML=`<span class="item-text">${ne(a)}</span>`,m.appendChild(f)}),w.textContent=`${y.length} stored in session`}n.addEventListener("click",async()=>{const a=e.value.trim();if(a)try{n.disabled=!0;const f=await h();y.push(a),await f.insert_texts([a],[]),e.value="",o(p,`✅ Stored: "${a.slice(0,50)}"`,"ok"),u()}catch(f){o(p,`❌ ${f.message}`,"err")}finally{n.disabled=!1}}),r.addEventListener("click",async()=>{try{r.disabled=!0,o(g,"⏳ Saving...","");const f=await(await h()).save();o(g,`✅ Saved to OPFS: "${f}"`,"ok")}catch(a){o(g,`❌ ${a.message}`,"err")}finally{r.disabled=!1}}),s.addEventListener("click",async()=>{try{s.disabled=!0,o(g,"⏳ Loading from OPFS...","");const f=await(await h()).load();o(g,`✅ Loaded: "${f}"`,"ok")}catch(a){o(g,`❌ ${a.message}`,"err")}finally{s.disabled=!1}}),d.addEventListener("click",async()=>{try{await(await h()).clear(),b=null,y=[],u(),_.innerHTML="",o(g,"✅ Cleared","ok")}catch(a){o(g,`❌ ${a.message}`,"err")}}),l.addEventListener("click",async()=>{const a=c.value.trim();if(a)try{l.disabled=!0,o(v,"🔍 Searching...",""),_.innerHTML="";const S=await(await h()).search(a,5,!1),x=typeof S=="string"?JSON.parse(S):S;if(!x?.length){o(v,"No results — store and save documents first.","");return}o(v,`${x.length} result(s)`,"ok"),x.forEach((q,k)=>{const J=F("div","list-item");J.innerHTML=`
          <span class="rank-badge">#${k+1}</span>
          <span class="item-text">${ne(y[q.id]??`[id:${q.id}]`)}</span>
          <span class="score-badge">${(q.score*100).toFixed(1)}%</span>
        `,_.appendChild(J)})}catch(f){o(v,`❌ ${f.message}`,"err")}finally{l.disabled=!1}}),e.addEventListener("keydown",a=>{a.key==="Enter"&&n.click()}),c.addEventListener("keydown",a=>{a.key==="Enter"&&l.click()}),u()}function ne(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const re=document.querySelectorAll(".tab-btn"),Se=document.querySelectorAll(".tab");re.forEach(t=>{t.addEventListener("click",()=>{re.forEach(n=>n.classList.remove("active")),Se.forEach(n=>n.classList.remove("active")),t.classList.add("active"),document.getElementById(`tab-${t.dataset.tab}`)?.classList.add("active")})});async function xe(){const t=document.getElementById("backend-txt");try{const{BarqVWeb:e}=await D(),n=new e("_probe",void 0);t.textContent=n.backend_info?.()??"WASM/Scalar",document.getElementById("backend-pill").style.borderColor="#10b981"}catch{t.textContent="Init failed",document.getElementById("backend-pill").style.borderColor="#ef4444"}}xe();me(document.getElementById("tab-text"));we(document.getElementById("tab-vector"));ve(document.getElementById("tab-hybrid"));he(document.getElementById("tab-persistence"));
