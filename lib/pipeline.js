"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDispatcher = exports.useCycleContext = exports.usePromise = exports.usePipeline = exports.Pipeline = void 0;
const async_pipeline_1 = require("./async-pipeline");
const AbortPipelineError_1 = __importDefault(require("./AbortPipelineError"));
const AttemptsExceeded_1 = __importDefault(require("./AttemptsExceeded"));
const Pipe_1 = require("./Pipe");
const TryAgainError_1 = __importDefault(require("./TryAgainError"));
const MaxAttempts = 7;
class Pipeline {
    constructor(pipe) {
        this.fake = false;
        this._pipes = [];
        if (pipe !== undefined) {
            this._pipes.push(pipe);
        }
    }
    pipe(pipe) {
        const asset = pipe;
        if (asset.length === 1) {
            this._pipes.push(new Pipe_1.Pipe(null, asset));
        }
        else if (asset.length === 2) {
            this._pipes.push(new Pipe_1.Pipe(asset));
        }
        else {
            throw new Error('bad pipe function');
        }
        return this;
    }
    append(pipeline) {
        this._pipes.unshift(new Pipe_1.Pipe(null, (arg) => {
            pipeline.run(arg);
        }));
        return this;
    }
    concat(pipeline) {
        pipeline.pipe(arg => {
            this.run(arg);
        });
        return pipeline;
    }
    pipeAsync(pipe) {
        const pipeline = new async_pipeline_1.PipelineAsync(this);
        pipeline.pipe(pipe);
        return pipeline;
    }
    mutate(transform) {
        const second = new Pipeline(new Pipe_1.Pipe(null, (arg) => {
            this._run(arg, 0);
            const result = transform(arg);
            second._run(result, 1);
            return result;
        }));
        second.fake = true;
        return second;
    }
    run(arg) {
        if (this.fake) {
            if (this._pipes[0] !== null) {
                return this._pipes[0].action(arg);
            }
            else {
                throw new Error('Bad Tranformation');
            }
        }
        else {
            this._run(arg, 0);
            return arg;
        }
    }
    async runStream(stream) {
        const reader = stream.getReader();
        let active;
        try {
            do {
                const result = await reader.read();
                active = result.done;
                const value = result.value;
                if (value !== undefined && value !== null) {
                    this.run(value);
                }
            } while (active);
        }
        catch (err) {
            throw err;
        }
        return;
    }
    _run(arg, index, attempts = 0) {
        if (this._pipes.length > index) {
            try {
                const current = this._pipes[index];
                if (current.autoContinue) {
                    current.action(arg);
                    this._run(arg, index + 1);
                }
                else {
                    current.func(arg, () => this._run(arg, index + 1));
                }
            }
            catch (err) {
                this.processException(err, attempts, arg, index);
            }
        }
    }
    processException(err, attempts, arg, index) {
        if (err instanceof TryAgainError_1.default) {
            if (attempts < MaxAttempts) {
                this._run(arg, index, attempts + 1);
            }
            else {
                throw new AttemptsExceeded_1.default();
            }
        }
        else if (err instanceof AbortPipelineError_1.default) {
        }
        else {
            throw err;
        }
    }
}
exports.Pipeline = Pipeline;
function usePipeline(first) {
    const asset = first;
    if (asset.length < 1 || asset.length > 2) {
        throw new Error('Invalid Initial Pipe');
    }
    return asset.length === 1 ? new Pipeline(new Pipe_1.Pipe(null, first)) : new Pipeline(new Pipe_1.Pipe(first, null));
}
exports.usePipeline = usePipeline;
function usePromise(from, pipeline) {
    return new Promise((resolve, reject) => {
        from.then(result => resolve(pipeline.run(result)))
            .catch(err => reject(err));
    });
}
exports.usePromise = usePromise;
function useCycleContext(pipeline, context) {
    context.call(null, (nextArg) => {
        pipeline.run(nextArg);
    });
}
exports.useCycleContext = useCycleContext;
function useDispatcher(pipeline, map) {
    return (arg) => pipeline.run(map(arg));
}
exports.useDispatcher = useDispatcher;
//# sourceMappingURL=pipeline.js.map