import { PipeFunc, Action } from './pipeline';
export declare class Pipe<T> {
    get autoContinue(): boolean;
    func: PipeFunc<T> | null;
    action: Action<T> | null;
    constructor(_func: any, _action: any);
}
