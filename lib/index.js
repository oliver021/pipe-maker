"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePipeline = void 0;
class Pipeline {
    constructor(pipe, pipes = []) {
        this._pipes = pipes;
        this.handler = pipe;
        this._pipes.push(this);
    }
    pipe(pipe) {
        return new Pipeline(pipe, this._pipes);
    }
    run(arg) {
        this._run(arg, 0);
    }
    _run(arg, index) {
        console.log(index);
        if (this._pipes.length > index) {
            const current = this._pipes[index];
            current.handler(arg, () => this._run(arg, index + 1));
        }
    }
}
exports.default = Pipeline;
function usePipeline(first) {
    return new Pipeline(first);
}
exports.usePipeline = usePipeline;
//# sourceMappingURL=index.js.map