import { PipeFunc, Action } from './pipeline';

/**
 * @class Pipe
 * @description represent a pipe agent
 */
export class Pipe<T> {
    public get autoContinue() {
        return this.action !== undefined;
    }
    public func: PipeFunc<T> | null = null;
    public action: Action<T> | null = null;
    constructor(_func: any, _action: any){
        if(_func !== null){
            this.func = _func;
        }else if(_action !== null){
            this.action = _action;
        }else{
            throw new Error('Invalid Pipe arguments');
        }
    }
}
