export declare class VNLayerError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
export declare class StoryLoadError extends VNLayerError {
}
export declare class StoryRuntimeError extends VNLayerError {
}
export declare class TagDispatchError extends VNLayerError {
}
export declare class InterruptError extends VNLayerError {
}
export type VNLayerErrorListener = (error: VNLayerError) => void;
export declare function onVNLayerError(listener: VNLayerErrorListener): () => void;
export declare function reportError(error: VNLayerError): void;
//# sourceMappingURL=errors.d.ts.map