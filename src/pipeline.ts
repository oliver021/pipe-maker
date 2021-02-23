import AbortPipelineError from './AbortPipelineError';
import AttemptsExceededError from './AttemptsExceeded';
import { Pipe } from './Pipe';
import { IPipelineMuted } from './PipelineMuted';
import TryAgainError from './TryAgainError';

/**
 * @const MaxAttempts {number}
 */
const MaxAttempts: number = 7;

/**
 * declration types
 */
export type Action<T> = (arg: T) => void;
export type PipeFunc<T> = (arg: T, next: () => void) => void;
export type TransformFunc<T,K> = (arg: T) => K;

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
    private fake: boolean = false;

    constructor(pipe?: Pipe<TInitial>){
        this._pipes = [];
        if(pipe !== undefined){
            this._pipes.push(pipe);
        }
    }

    pipe(pipe: Action<TInitial>): Pipeline<TInitial>

    /**
     * @method
     * @param pipe the next pipe to execute
     */
    pipe(pipe: PipeFunc<TInitial>): Pipeline<TInitial>{
        const asset = pipe as any;
        if(asset.length === 1){
            this._pipes.push(new Pipe(null, asset));
        }else if(asset.length === 2){
            this._pipes.push(new Pipe(asset, null));
        }else{
            throw new Error('bad pipe function');
        }
        return this;
    }

    /**
     * @method
     * @param transform {TransformFunc<TInitial,K>} this is a function that transform the pipeline context
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
     * @method
     * @param arg {TInitial} this is a the argument to whole the pipeline
     */
    run(arg: TInitial): TInitial{
       if(this.fake){
         if(this._pipes[0] !== null) {
            return (this._pipes[0].action as Action<TInitial>)(arg) as unknown as TInitial;
         }else{
             throw new Error('Bad Tranformation');
         }
       }else{
         this._run(arg, 0);
         return arg;
       }
    }

    private _run(arg:any, index: number, attempts: number = 0){
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
                if(err instanceof TryAgainError){
                    if(attempts < MaxAttempts){
                        // try run pipe again
                       this._run(arg, index, attempts + 1);
                    }else{
                        // not allowd more than seven attempts
                        throw new AttemptsExceededError();
                    }
                }else if(err instanceof AbortPipelineError){
                    // silent throw
                }else{
                    // if the error type is any other error then is throw
                    throw err;
                }
            }
         }
    }
}

/**
 * @function
 * @param first handle the first Action
 * @description The basic helper to create a pipiline by functions
 */
function usePipeline<T>(first: Action<T>): Pipeline<T>
function usePipeline<T>(first: PipeFunc<T>): Pipeline<T>{
    const asset = (first as any);
    if(asset.length < 1 || asset.length > 2){
        throw new Error('Invalid Initial Pipe');
    }
    return asset.length === 1 ? new Pipeline<T>(new Pipe<T>(null, first)) : new Pipeline<T>(new Pipe<T>(first, null));
}

export { usePipeline }