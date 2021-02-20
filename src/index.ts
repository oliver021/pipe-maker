export type PipeFunc<T> = (arg: T, next: Function) => void;

/**
 * @class
 * @description The pipline class is representation abstract of functions as a pipeline
 */
export default class Pipeline<TInitial>{

    /**
     * @property
     * @description The main function to execute this pipe
     */
    public handler: PipeFunc<TInitial>;

    /**
     * @property
     * @access private
     * @description Allow store all pipes
     */
    private _pipes: Array<Pipeline<TInitial>>;

    constructor(pipe: PipeFunc<TInitial>, pipes: Array<Pipeline<TInitial>> = []){
        this._pipes = pipes;
        this.handler = pipe;
        this._pipes.push(this);
    }

    /**
     * @method
     * @param pipe the next pipe to execute
     */
    pipe(pipe: PipeFunc<TInitial>){
        return new Pipeline<TInitial>(pipe, this._pipes);
    }

    /**
     * @method
     * @param arg {TInitial} this is a the argument to whole the pipeline
     */
    run(arg: TInitial){
       this._run(arg, 0);
    }

    private _run(arg:any, index: number){
        console.log(index);
         if(this._pipes.length > index){
            const current = this._pipes[index]
            current.handler(arg, () => this._run(arg, index+1));
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