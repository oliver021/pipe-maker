export declare type Action<T> = (arg: T) => void;
export declare type PipeFunc<T> = (arg: T, next: () => void) => void;
export declare type AsyncPipe<T> = (arg: T, next: () => Promise<void>) => Promise<void>;
export declare type TransformFunc<T, K> = (arg: T) => K;
