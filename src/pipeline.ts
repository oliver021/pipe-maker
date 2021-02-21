import AttemptsExceededError from './AttemptsExceeded';
import { IPipelineMuted } from './PipelineMuted';
import TryAgainError from './TryAgainError';
import AbortPipelineError from '../types/AbortPipelineError';

/**
 * @const MaxAttempts {number}
 */
const MaxAttempts: number = 7;

/**
 * declration types
 */
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
    protected _pipes: PipeFunc<TInitial>[];

    /**
     * @property fake {boolean}
     * @access private
     * @description if is true the pipeline not executed all pipes
     */
    private fake: boolean = false;

    constructor(pipe?: PipeFunc<TInitial>){
        this._pipes = [];
        if(pipe !== undefined){
            this._pipes.push(pipe);
        }
    }

    /**
     * @method
     * @param pipe the next pipe to execute
     */
    pipe(pipe: PipeFunc<TInitial>){
        this._pipes.push(pipe);
        return this;
    }

    mutate<K>(transform: TransformFunc<TInitial,K>){
        const second = new Pipeline<K>(arg =>{
            this._run(arg, 0);
            second._run(transform(arg as unknown as TInitial), 0);
        });
        return second as unknown as IPipelineMuted<TInitial,K>;
    }

    /**
     * @method
     * @param arg {TInitial} this is a the argument to whole the pipeline
     */
    run(arg: TInitial){
       if(this.fake){
        this._pipes[0](arg, () => null);
       }else{
        this._run(arg, 0);
       }
    }

    private _run(arg:any, index: number, attempts: number = 0){
         if(this._pipes.length > index){
            try{
                const current = this._pipes[index]
                current(arg, () => this._run(arg, index+1));
            }catch(err: unknown){
                if(err instanceof TryAgainError){
                    if(attempts < MaxAttempts){
                       this._run(arg, index, attempts + 1);
                    }else{
                        throw new AttemptsExceededError();
                    }
                }else if(err instanceof AbortPipelineError){
                    // silent throw
                }else{
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
export function usePipeline<T>(first: PipeFunc<T>): Pipeline<T>{
    return new Pipeline<T>(first);
}