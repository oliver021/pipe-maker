import { IPipelineMuted } from './PipelineMuted';
export declare type PipeFunc<T> = (arg: T, next: () => void) => void;
export declare type TransformFunc<T, K> = (arg: T) => K;
export declare class Pipeline<TInitial> {
    protected _pipes: PipeFunc<TInitial>[];
    private fake;
    constructor(pipe?: PipeFunc<TInitial>);
    pipe(pipe: PipeFunc<TInitial>): this;
    mutate<K>(transform: TransformFunc<TInitial, K>): IPipelineMuted<TInitial, K>;
    run(arg: TInitial): void;
    private _run;
}
export declare function usePipeline<T>(first: PipeFunc<T>): Pipeline<T>;
