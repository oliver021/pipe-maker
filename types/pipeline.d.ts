import { Pipe } from './Pipe';
import { IPipelineMuted } from './PipelineMuted';
export declare type Action<T> = (arg: T) => void;
export declare type PipeFunc<T> = (arg: T, next: () => void) => void;
export declare type TransformFunc<T, K> = (arg: T) => K;
export declare class Pipeline<TInitial> {
    protected _pipes: Pipe<TInitial>[];
    private fake;
    constructor(pipe?: Pipe<TInitial>);
    pipe(pipe: Action<TInitial>): Pipeline<TInitial>;
    mutate<K>(transform: TransformFunc<TInitial, K>): IPipelineMuted<TInitial, K>;
    run(arg: TInitial): TInitial;
    private _run;
}
declare function usePipeline<T>(first: Action<T>): Pipeline<T>;
export { usePipeline };
