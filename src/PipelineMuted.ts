import { PipeFunc } from "./pipeline";


export interface IPipelineMuted<TInitial, K>  {
     pipe(pipe: PipeFunc<K>): IPipelineMuted<TInitial, K>;
     run(arg: TInitial): void;
}
