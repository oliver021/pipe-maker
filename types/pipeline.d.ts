import { PipelineAsync } from './async-pipeline';
import { Action, AsyncPipe, TransformFunc } from './Action';
import { Pipe } from './Pipe';
import { IPipelineMuted } from './PipelineMuted';
export declare class Pipeline<TInitial> {
    protected _pipes: Pipe<TInitial>[];
    private fake;
    constructor(pipe?: Pipe<TInitial>);
    pipe(pipe: Action<TInitial>): Pipeline<TInitial>;
    append(pipeline: Pipeline<TInitial>): this;
    concat(pipeline: Pipeline<TInitial>): Pipeline<TInitial>;
    pipeAsync(pipe: AsyncPipe<TInitial>): PipelineAsync<TInitial>;
    mutate<K>(transform: TransformFunc<TInitial, K>): IPipelineMuted<TInitial, K>;
    run(arg: TInitial): TInitial;
    runStream(stream: ReadableStream<TInitial>): Promise<void>;
    private _run;
    private processException;
}
declare function usePipeline<T>(first: Action<T>): Pipeline<T>;
export { usePipeline };
export declare function usePromise<T>(from: Promise<T>, pipeline: Pipeline<T>): Promise<T>;
declare type ProviderAlias<T> = (nextArg: T) => void;
export declare function useCycleContext<T>(pipeline: Pipeline<T>, context: (provider: ProviderAlias<T>) => void): void;
export declare function useDispatcher<T, K>(pipeline: Pipeline<T>, map: (arg: K) => T): (arg: K) => T;
