"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAsyncFrom = exports.usePipelineAsync = exports.PipelineAsync = void 0;
const Pipe_1 = require("./Pipe");
class PipelineAsync {
    constructor(_parent = null) {
        this.parent = null;
        this.pipes = [];
        this.parent = _parent;
    }
    pipe(funcAsync) {
        const pipe = new Pipe_1.Pipe();
        pipe.isAsync = true;
        pipe.funcAsync = funcAsync;
        this.pipes.push(pipe);
    }
    run(arg, onFinished, onError) {
        var _a;
        this._runAsyncPipes(this.parent !== null ? (_a = this.parent) === null || _a === void 0 ? void 0 : _a.run(arg) : arg)
            .then(onFinished)
            .catch(onError);
    }
    runAsync(arg) {
        var _a;
        return this._runAsyncPipes(this.parent !== null ? (_a = this.parent) === null || _a === void 0 ? void 0 : _a.run(arg) : arg);
    }
    async _runAsyncPipes(arg, index = 0) {
        var _a;
        if (this.pipes.length >= index) {
            return;
        }
        const current = this.pipes[index];
        try {
            if (current.funcAsync !== null) {
                await ((_a = current.funcAsync) === null || _a === void 0 ? void 0 : _a.call(null, arg, () => this._runAsyncPipes(arg, index + 1)));
            }
        }
        catch (err) {
            throw err;
        }
    }
}
exports.PipelineAsync = PipelineAsync;
function usePipelineAsync(funcAsync) {
    const pipeline = new PipelineAsync();
    pipeline.pipe(funcAsync);
    return pipeline;
}
exports.usePipelineAsync = usePipelineAsync;
async function useAsyncFrom(from, build) {
    const pipeline = new PipelineAsync();
    build(pipeline);
    const result = await from;
    await pipeline.runAsync(result);
    return result;
}
exports.useAsyncFrom = useAsyncFrom;
//# sourceMappingURL=async-pipeline.js.map