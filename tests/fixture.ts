// define and export sample function to return Promise
// the name of the function is SampleAsync
// recive a number as parameter and return a Promise that modifies the number
// use timeout to simulate async
export function SampleAsync(num: number): Promise<number> {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve(num + 1);
        }, 500);
    });
}