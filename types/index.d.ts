export declare type PipeFunc<T> = (arg: T, next: Function) => void;
export default class Pipeline<TInitial> {
    handler: PipeFunc<TInitial>;
    private _pipes;
    constructor(pipe: PipeFunc<TInitial>, pipes?: Array<Pipeline<TInitial>>);
    pipe(pipe: PipeFunc<TInitial>): Pipeline<TInitial>;
    run(arg: TInitial): void;
    private _run;
}
export declare function usePipeline<T>(first: PipeFunc<T>): Pipeline<T>;
