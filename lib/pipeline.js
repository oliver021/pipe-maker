"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePipeline = exports.Pipeline = void 0;
class Pipeline {
    constructor(pipe) {
        this.fake = false;
        this._pipes = [];
        if (pipe !== undefined) {
            this._pipes.push(pipe);
        }
    }
    pipe(pipe) {
        this._pipes.push(pipe);
        return this;
    }
    mutate(transform) {
        const second = new Pipeline(arg => {
            this._run(arg, 0);
            second._run(transform(arg), 0);
        });
        return second;
    }
    run(arg) {
        if (this.fake) {
            this._pipes[0](arg, () => null);
        }
        else {
            this._run(arg, 0);
        }
    }
    _run(arg, index) {
        if (this._pipes.length > index) {
            const current = this._pipes[index];
            current(arg, () => this._run(arg, index + 1));
        }
    }
}
exports.Pipeline = Pipeline;
function usePipeline(first) {
    return new Pipeline(first);
}
exports.usePipeline = usePipeline;
//# sourceMappingURL=pipeline.js.map