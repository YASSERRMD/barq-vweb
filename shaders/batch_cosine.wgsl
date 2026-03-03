@group(0) @binding(0) var<storage, read> query: array<f32>;
@group(0) @binding(1) var<storage, read> corpus: array<f32>;
@group(0) @binding(2) var<storage, read_write> results: array<f32>;
@group(0) @binding(3) var<uniform> d: u32;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let n_idx = global_id.x;
    let dim = d;
    
    // Bounds check omitted for brevity but should be added
    var dot = 0.0f;
    var anorm = 0.0f;
    var bnorm = 0.0f;
    
    for (var i = 0u; i < dim; i = i + 1u) {
        let a = query[i];
        let b = corpus[n_idx * dim + i];
        dot = dot + a * b;
        anorm = anorm + a * a;
        bnorm = bnorm + b * b;
    }
    
    if (anorm == 0.0f || bnorm == 0.0f) {
        results[n_idx] = 0.0f;
    } else {
        results[n_idx] = dot / (sqrt(anorm) * sqrt(bnorm));
    }
}
