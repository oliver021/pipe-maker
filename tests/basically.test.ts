import { expect } from 'chai';
import { Pipeline } from '../src/pipeline';
import { SampleAsync as incrementAsync } from './fixture';

// fixtures types
type NumberContext = {num: number};

describe("intro test for func-pipeline", () => {

    it("should be able to create a pipeline", () => 
    {
        const pipeline = new Pipeline<number>();
        expect(pipeline).instanceOf(Pipeline);
    });

    it("should be able to add a pipe", () => {
        const pipeline = new Pipeline<number>();
        pipeline.pipe((x) => {x = 11 + x});
        expect(pipeline.length).equal(1);
    });

    it("should be able run", () => {
            // fix number
            const literal = 11;

            // initialize sample context to pass to pipeline
            let ctx = {num: 0};

            // create a pipeline
            const pipeline = new Pipeline<NumberContext>();

            // add a pipe
            pipeline.pipe((x) => {x.num = literal + x.num});

            // run the pipeline
            let result = pipeline.run(ctx);

            // assertion for result
            expect(result.num).equal(literal);
        });

        it("should be able to run with async", async () => {
            // fix number
            const literal = 11;

            // initialize sample context to pass to pipeline
            let ctx = {num: literal};

            // create a pipeline
            const pipeline = new Pipeline<NumberContext>();

            // add a pipe
            const asyncPipeline = pipeline.pipeAsync(async (x, next) => {
                x.num = await incrementAsync(x.num); 
                next();
            });

            // run the pipeline
            let result = await asyncPipeline.runAsync(ctx);

            // assertion for result
            expect(result.num).equal(literal + 1);
        });
});
