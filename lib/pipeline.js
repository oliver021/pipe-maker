"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePipeline = exports.Pipeline = void 0;
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
            this._pipes.push(new Pipe_1.Pipe(asset, null));
        }
        else {
            throw new Error('bad pipe function');
        }
        return this;
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
//# sourceMappingURL=pipeline.js.map