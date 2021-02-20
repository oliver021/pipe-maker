const { assert } = require("chai");
const { usePipeline } = require("./lib/index");

describe('The basic test to ensure that pipeline is working...', function(){

    it('First...', () =>
    {
        function someObject(){
            this.test = false;
        }

        const value = new someObject();
        const pipeline = usePipeline((x, next) => { x.test = true; next(); })
        .pipe((x, next) => { x.test = false; next(); })
        .pipe((x, next) => { x.test = true;  });

        pipeline.run(value);
        assert.isTrue(value.test);
    });

    it('Second...', () =>
    {
        function someObject(){
            this.test = null;
            this.times = 0;
        }

        const value = new someObject();
        usePipeline((x, next) => { x.test = 11; x.times++; next(); })
        .pipe((x, next) => { x.test = "data";  x.times++; })
        .pipe((x, next) => { x.test = true;  x.times++;  })
        .run(value);
        assert.isNotNull(value.test);
        assert.isString(value.test);
        assert.equal(value.times, 2);
    });
});