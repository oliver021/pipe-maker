/**
 * declration types
 */

export type Action<T> = (arg: T) => void;
export type PipeFunc<T> = (arg: T, next: () => void) => void;
export type AsyncPipe<T> = (arg: T, next: () => Promise<void>) => Promise<void>;
export type TransformFunc<T, K> = (arg: T) => K;
