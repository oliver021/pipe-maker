import { PipeFunc, Action, AsyncPipe } from "./Action";

/**
 * @class Pipe
 * @description represent a pipe agent
 */
export class Pipe<T> {
    public isAsync = false;
    public get autoContinue() {
        return this.action !== null;
    }
    public func: PipeFunc<T> | null = null;
    public action: Action<T> | null = null;
    public funcAsync?: AsyncPipe<T>;
    constructor(_func: any = null, _action: any = null){
        if(_func !== null){
            this.func = _func;
        }else if(_action !== null){
            this.action = _action;
        }else{
            throw new Error('Invalid Pipe arguments');
        }
    }
}
