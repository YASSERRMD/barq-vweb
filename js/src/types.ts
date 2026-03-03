export interface SearchResult {
    id: number;
    score: number;
    text?: string;
    metadata?: any;
}

export interface BackendInfo {
    gpu: boolean;
    npu: boolean;
    cpu: boolean;
    macMSeries: boolean;
    backendString: string;
}

export interface InsertOptions {
    batchSize?: number;
}

export interface SearchOptions {
    topK?: number;
    hybrid?: boolean;
}

export interface VectorEntry {
    id: number;
    vec: Float32Array;
    text?: string;
    metadata?: any;
}
