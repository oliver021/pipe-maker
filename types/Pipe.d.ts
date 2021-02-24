import { PipeFunc, Action, AsyncPipe } from "./Action";
export declare class Pipe<T> {
    isAsync: boolean;
    get autoContinue(): boolean;
    func: PipeFunc<T> | null;
    action: Action<T> | null;
    funcAsync?: AsyncPipe<T>;
    constructor(_func?: any, _action?: any);
}
