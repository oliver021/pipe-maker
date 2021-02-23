# Welcome to pipeline-runner 👋
[![Version](https://img.shields.io/npm/v/pipeline-runner.svg)](https://www.npmjs.com/package/pipeline-runner)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/oliver021/func-pipe#readme)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/oliver021/func-pipe/graphs/commit-activity)
[![License: MIT](https://img.shields.io/github/license/oliver021/pipeline-runner)](https://github.com/oliver021/func-pipe/blob/master/LICENSE)

>  This library provides a mechanism to create flows of calls to functions in the form of a pipeline with a fluid and very flexible API.

### 🏠 [Homepage](https://github.com/oliver021/func-pipe#readme)

## Install

```sh
npm install pipeline-runner
```

> Note: The package includes Typescript type metadata for secure typing support, it is lightweight and easy to use. It's very cool

## Usage

This library allows to implement a well-known and used pipeline pattern, for example, in the http framework that performs a pipeline of the processing of the incoming http request, where a context is handled that is passed to each agent / function to receive said context and a 'next' function that allows the execution line to continue. The philosophy is simple and well known

```javascript
const { usePipeline } = require("pipeline-runner");

function someObject(){
  this.test = false;
}

const value = new someObject();
const pipeline = usePipeline((x, next) => { x.test = true; next(); })
 .pipe((x, next) => { x.test = false; next(); })
 .pipe((x, next) => { x.test = true;  });
pipeline.run(value); // the last agent set the value to true
```

#### Observation

- The 'next' argument allows the execution of the next agent in the pipeline to continue.
- You can import the 'usePipeline' helper to factory a pipeline object without instance the class.
- The method run invoke the pipeline and require an argument that this is a context

```javascript
const { usePipeline } = require("pipeline-runner");

function someObject(){
  this.test = false;
}

const value = new someObject();
const pipeline = usePipeline((x, next) => { x.test = true; next(); })
 .pipe((x, next) => { x.test = false;  })
 .pipe((x, next) => { x.test = true;  });
pipeline.run(value); // the last agent executed set false because the next is not invoked
```

> Note: If the argument is 'next' it is omitted, that is, a function is passed that only receives one argument, the context, then the pipeline is given continuously by itself

#### Using Typescript

```typescript
import { usePipeline } from 'pipeline-runner';

class ContextA {
    public msg: string;
    public num: number;
}

// tslint:disable-next-line: max-classes-per-file
class ContextB {
    public result: string;
    constructor(_result: string){
        this.result = _result;
    }
}

const result = usePipeline<ContextA>(x => x.msg = "data")
.pipe(x => x.num = 22)
.mutate(x => new ContextB(`this is a message: ${x.msg} and number ${x.num}`))
.pipe(x => x.result += '...')
.run(new ContextA())

console.log(result.result);
```

Typescript allows to improve the development experience significantly for well-known reasons, it also makes using the context mutations make sense, since in each mutation the IDE through the type system, it will not say the properties and context methods that we are passing in the pipeline In other words, we will have autocompletion of the current context using the 'pipe' method and when we invoke 'run', the type of argument will be the one that initially had the first pipeline instance. So the 'mutate' method concatenates *n* pipes as we like to allow us a flexible and typed flow.

> Note: Note that you are using functions in this pipeline without the next argument, an example of an auto continuous pipeline

## Run tests

You can run the many tests included in this repo, then you must clone this repo and install dependencies.

```sh
npm run test
```

## Author

👤 **Oliver Valiente**

* Github: [@oliver021](https://github.com/oliver021)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/oliver021/func-pipe/issues). You can also take a look at the [contributing guide](https://github.com/oliver021/func-pipe/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

Copyright © 2021 [Oliver Valiente](https://github.com/oliver021).

This project is [MIT](https://github.com/oliver021/func-pipe/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_