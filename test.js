var MyPromise = require('./promise');

var promise1 = new MyPromise((resolve) => {
    setTimeout(() => {
        resolve("promise1 success");
    }, 2000);
});

promise1.then((value) => {
    console.log(value)
})

var promise2 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        reject("promise2 rejected");
    }, 1000);
})

promise2.then(function(value) {
    console.log(value);
}, function(reason) {
    console.error(reason);
})