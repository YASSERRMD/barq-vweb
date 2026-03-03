use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use js_sys::{Reflect, Promise, Array, Object};

const SHADER_CODE: &str = include_str!("../../../shaders/batch_cosine.wgsl");

pub struct GpuContext {
    #[allow(dead_code)]
    device: JsValue,
    #[allow(dead_code)]
    pipeline: JsValue,
}

impl GpuContext {
    pub async fn new() -> Result<Self, JsValue> {
        let window = web_sys::window().ok_or("No window")?;
        let navigator = window.navigator();
        let gpu_val = Reflect::get(&navigator, &JsValue::from_str("gpu"))?;
        if gpu_val.is_undefined() {
            return Err(JsValue::from_str("WebGPU not supported"));
        }
        
        let req_adapter = Reflect::get(&gpu_val, &JsValue::from_str("requestAdapter"))?.dyn_into::<js_sys::Function>()?;
        let adapter_promise = Reflect::apply(&req_adapter, &gpu_val, &Array::new())?;
        let adapter_val = JsFuture::from(adapter_promise.unchecked_into::<Promise>()).await?;
        if adapter_val.is_null() || adapter_val.is_undefined() {
            return Err(JsValue::from_str("No adapter found"));
        }
        
        let req_device = Reflect::get(&adapter_val, &JsValue::from_str("requestDevice"))?.dyn_into::<js_sys::Function>()?;
        let device_promise = Reflect::apply(&req_device, &adapter_val, &Array::new())?;
        let device = JsFuture::from(device_promise.unchecked_into::<Promise>()).await?;

        let shader_desc = Object::new();
        Reflect::set(&shader_desc, &JsValue::from_str("code"), &JsValue::from_str(SHADER_CODE))?;
        let create_shader = Reflect::get(&device, &JsValue::from_str("createShaderModule"))?.dyn_into::<js_sys::Function>()?;
        let args = Array::new();
        args.push(&shader_desc);
        let shader_module = Reflect::apply(&create_shader, &device, &args)?;

        let pipeline_desc = Object::new();
        Reflect::set(&pipeline_desc, &JsValue::from_str("layout"), &JsValue::from_str("auto"))?;
        
        let compute_desc = Object::new();
        Reflect::set(&compute_desc, &JsValue::from_str("module"), &shader_module)?;
        Reflect::set(&compute_desc, &JsValue::from_str("entryPoint"), &JsValue::from_str("main"))?;
        Reflect::set(&pipeline_desc, &JsValue::from_str("compute"), &compute_desc)?;

        let create_pipeline = Reflect::get(&device, &JsValue::from_str("createComputePipelineAsync"))?.dyn_into::<js_sys::Function>()?;
        let args2 = Array::new();
        args2.push(&pipeline_desc);
        let pipeline_promise = Reflect::apply(&create_pipeline, &device, &args2)?;
        let pipeline = JsFuture::from(pipeline_promise.unchecked_into::<Promise>()).await?;

        Ok(Self { device, pipeline })
    }

    pub async fn batch_cosine_gpu(&self, _query: &[f32], _corpus: &[f32], n: usize, _d: usize) -> Result<Vec<f32>, JsValue> {
        let sim_results = vec![0.0_f32; n];
        Ok(sim_results) 
    }
}
