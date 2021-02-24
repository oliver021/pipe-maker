import { AsyncPipe } from './Action';
import { Pipe } from './Pipe';
import { Pipeline } from './pipeline';
export interface IPipelineAsync<TContext> {
    pipe(funcAsync: AsyncPipe<TContext>): void;
}
export declare class PipelineAsync<TContext> implements IPipelineAsync<TContext> {
    parent: Pipeline<TContext> | null;
    pipes: Pipe<TContext>[];
    constructor(_parent?: Pipeline<TContext> | null);
    pipe(funcAsync: AsyncPipe<TContext>): void;
    run(arg: TContext, onFinished?: () => void, onError?: (err: unknown) => void): void;
    runAsync(arg: TContext): Promise<void>;
    private _runAsyncPipes;
}
export declare function usePipelineAsync<TContext>(funcAsync: AsyncPipe<TContext>): PipelineAsync<TContext>;
export declare function useAsyncFrom<T>(from: Promise<T>, build: (builder: IPipelineAsync<T>) => void): Promise<T>;
