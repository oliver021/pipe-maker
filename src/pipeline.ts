import { PipelineAsync } from './async-pipeline';
import AbortPipelineError from './AbortPipelineError';
import { Action, PipeFunc, AsyncPipe, TransformFunc } from './Action';
import AttemptsExceededError from './AttemptsExceeded';
import { Pipe } from './Pipe';
import { IPipelineMuted } from './PipelineMuted';
import TryAgainError from './TryAgainError';

/**
 * @const {number} MaxAttempts
 * @description set the limit to repeat a pipe execution
 */
const MaxAttempts = 7;

/**
 * @class
 * @description The pipline class is representation abstract of functions as a pipeline
 */
export class Pipeline<TInitial>{

    /**
     * @property
     * @access private
     * @description Allow store all pipes
     */
    protected _pipes: Pipe<TInitial>[];

    /**
     * @property fake {boolean}
     * @access private
     * @description if is true the pipeline not executed all pipes
     */
    private fake = false;

    /**
     * @property length()
     * @returns {number} the number of pipes in the pipeline
     */
    get length(): number{
        return this._pipes.length;
    }

    /**
     * @constructor
     * @param {Pipe<TInitial>} pipe initialize the first pipe
     */
    constructor(pipe?: Pipe<TInitial>){
        this._pipes = [];
        if(pipe !== undefined){
            this._pipes.push(pipe);
        }
    }

    /**
     * @method pipe
     * @param { PipeFunc<TInitial>} pipe the next pipe to execute
     */
    pipe(pipe: Action<TInitial>): Pipeline<TInitial>

    /**
     * @method pipe
     * @param { PipeFunc<TInitial>} pipe the next pipe to execute
     */
    pipe(pipe: PipeFunc<TInitial>): Pipeline<TInitial>{
        const asset = pipe as any;
        if(asset.length === 1){
            this._pipes.push(new Pipe(null, asset));
        }else if(asset.length === 2){
            this._pipes.push(new Pipe(asset));
        }else{
            throw new Error('bad pipe function');
        }
        return this;
    }

    /**
     * @method append
     * @param {Pipeline<TInitial>} pipeline the pipeline instance to append
     */
    append(pipeline: Pipeline<TInitial>){
        this._pipes.unshift(new Pipe(null, (arg: TInitial) =>{
            pipeline.run(arg);
        }));
        return this;
    }

    /**
     * @method concat
     * @param {Pipeline<TInitial>} pipeline the pipeline instance to concatenate
     */
    concat(pipeline: Pipeline<TInitial>){
        pipeline.pipe(arg =>{
            this.run(arg);
        });
        return pipeline;
    }

    /**
     * @method pipeAsync
     * @param {AsyncPipe<TInitial>} pipe the async pipe to handle async flow
     * @return a new pipeline async instance
     */
    pipeAsync(pipe: AsyncPipe<TInitial>): PipelineAsync<TInitial>{
        const pipeline = new PipelineAsync<TInitial>(this);
        pipeline.pipe(pipe); // new pipe to create async flow by Promise
        return pipeline;
    }

    /**
     * @method mutate<K>
     * @param {TransformFunc<TInitial,K>} transform this is a function that transform the pipeline context
     */
    mutate<K>(transform: TransformFunc<TInitial,K>): IPipelineMuted<TInitial,K>{
        const second = new Pipeline<K>(new Pipe<K>(null, (arg: TInitial) =>{
            this._run(arg, 0);
            const result = transform(arg as unknown as TInitial);
            second._run(result, 1);
            return result;
        }));
        second.fake = true;
        return second as unknown as IPipelineMuted<TInitial,K>;
    }

    /**
     * @method run
     * @param arg {TInitial} this is a the argument to whole the pipeline
     */
    run(arg: TInitial): TInitial{
       if(this.fake){
         if(this._pipes[0] !== null) {
             (this._pipes[0].action as Action<TInitial>)(arg) as unknown as TInitial;
             return arg;
         }else{
             throw new Error('Bad Tranformation');
         }
       }else{
         this._run(arg, 0);
         return arg;
       }
    }

    /**
     * @method runStream
     * @param {ReadableStream<TInitial>} stream the stream that to provide
     * contexts as argument the pipeline execution
     * @description set the behavior of the pipeline to process async pipes
     * @returns a new Promise
     */
    async runStream(stream: ReadableStream<TInitial>): Promise<void>{
        const reader = stream.getReader();
        let active: boolean;
        try{
            do{
                const result = await reader.read();
                active = result.done;
                const value = result.value;
                if(value !== undefined && value !== null){
                    this.run(value as TInitial);
                }
            }while(active);
        }catch(err){
            throw err;
        }
        return;
    }

    private _run(arg:any, index: number, attempts = 0){
         if(this._pipes.length > index){
            try{
                const current = this._pipes[index]
                if(current.autoContinue){
                    (current.action as Action<TInitial>)(arg);
                    this._run(arg, index+1)
                }else{
                    (current.func as PipeFunc<TInitial>)(arg, () => this._run(arg, index+1));
                }
            }catch(err: unknown){
                // the catch cycle by eror type
                this.processException(err, attempts, arg, index);
            }
         }
    }

    private processException(err: unknown, attempts: number, arg: any, index: number) {
        if (err instanceof TryAgainError) {
            if (attempts < MaxAttempts) {
                // try run pipe again
                this._run(arg, index, attempts + 1);
            } else {
                // not allowd more than seven attempts
                throw new AttemptsExceededError();
            }
        } else if (err instanceof AbortPipelineError) {
            // silent throw
        } else {
            // if the error type is any other error then is throw
            throw err;
        }
    }
}

/**
 * @function usePipeline
 * @param {PipeFunc<T>} first handle the first Action
 * @description The basic helper to create a pipiline by functions
 * @return new pipeline instance
 */
function usePipeline<T>(first: Action<T>): Pipeline<T>

/**
 * @function
 * @param {PipeFunc<T>} first the first pipe to execute
 * @description The basic helper to create a pipiline by functions
 * @return new pipeline instance
 */
function usePipeline<T>(first: PipeFunc<T>): Pipeline<T>{
    const asset = (first as any);
    if(asset.length < 1 || asset.length > 2){
        throw new Error('Invalid Initial Pipe');
    }
    return asset.length === 1 ? new Pipeline<T>(new Pipe<T>(null, first)) : new Pipeline<T>(new Pipe<T>(first, null));
}

// export the function with its overload
export { usePipeline }

/**
 * @function usePromise
 * @param {Promise<T>} from the promise to use
 * @param {Pipeline<T>} pipeline the pipeline to handle the promise result
 * @return a new Promise
 */
export function usePromise<T>(from: Promise<T>, pipeline: Pipeline<T>): Promise<T>{
    return new Promise<T>((resolve, reject) => {
        from.then(result => resolve(pipeline.run(result)))
        .catch(err => reject(err));
    });
}

// simple and trivial alias
type ProviderAlias<T> = (nextArg: T) => void;

/**
 * @function useCycleContext<T>
 * @argument T
 * @param {Pipeline<T>} pipeline the pipeline to handle the context
 * @param {ProviderAlias<T>} context  The context where the pipeline is executed
 */
export function useCycleContext<T>(pipeline: Pipeline<T>, context: (provider: ProviderAlias<T>) => void){
    context.call(null, (nextArg: T) => {
        pipeline.run(nextArg);
    });
}

/**
 * @function useDispatcher<T,K>
 * @param { Pipeline<T> } pipeline he pipeline to handle the context
 * @param { (arg: K) => T } map the function to convert context
 * @description create a dispatcher function to invoke the pipeline
 * @return function as dispatcher
 */
export function useDispatcher<T, K>(pipeline: Pipeline<T>, map: (arg: K) => T){
    // dispacth is simple function
    // return a dispatcher func
    return (arg: K) => pipeline.run(map(arg));
}