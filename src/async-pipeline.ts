import { AsyncPipe } from './Action';
import { Pipe } from './Pipe';
import { Pipeline } from './pipeline';

/**
 * @abstract
 * @interface IPipelineAsync<TContext>
 * @description Simple contract to method pipe
 */
export interface IPipelineAsync<TContext>{

    /**
     * @method pipe
     * @param {AsyncPipe<TContext>} funcAsync pipe to execute
     */
    pipe(funcAsync: AsyncPipe<TContext>): void;
}

/**
 * @class
 * @description this is a pipeline with async invokation flow
 */
export class PipelineAsync<TContext> implements IPipelineAsync<TContext> {
    public parent: Pipeline<TContext> | null = null;
    public pipes: Pipe<TContext>[] = [];

    constructor(_parent: Pipeline<TContext> | null = null){
        this.parent = _parent;
    }

    pipe(funcAsync: AsyncPipe<TContext>){
        const pipe = new Pipe<TContext>();
        pipe.isAsync = true;
        pipe.funcAsync = funcAsync;
        this.pipes.push(pipe);
    }

    run(arg: TContext, onFinished?: () => void, onError?: (err:unknown)=> void){
        this._runAsyncPipes(this.parent !== null ? this.parent?.run(arg) : arg)
        .then(onFinished)
        .catch(onError);
    }

    runAsync(arg: TContext): Promise<void>{
        return this._runAsyncPipes(this.parent !== null ? this.parent?.run(arg) : arg);
    }

    private async _runAsyncPipes(arg: TContext, index = 0): Promise<void>{
        if(this.pipes.length >= index){
            // no efffect to inkove 'next'
            return ;
        }
        const current = this.pipes[index];
        try{
            if(current.funcAsync !== null){
                // executed promise as async code
                await current.funcAsync?.call(null, arg, () => this._runAsyncPipes(arg, index+1));
            }
        }catch(err){
            throw err;
        }
    }
}

/**
 * @function usePipelineAsync
 * @param {AsyncPipe<TContext>} funcAsync the first agent to execute
 * @description The basic factory for pipeline async
 * @return new pipeline async instance
 */
export function usePipelineAsync<TContext>(funcAsync: AsyncPipe<TContext>){
    const pipeline = new PipelineAsync<TContext>();
    pipeline.pipe(funcAsync);
    return pipeline;
}

/**
 * @function useAsyncFrom
 * @param {Promise<T>} from The promise to use as context provider
 * @param {IPipelineAsync<T>} build a function to build a context
 */
export async function useAsyncFrom<T>(from: Promise<T>, build: (builder: IPipelineAsync<T>) => void): Promise<T>{
    const pipeline = new PipelineAsync<T>();
    build(pipeline);
    const result = await from;
    await pipeline.runAsync(result);
    return result;
}