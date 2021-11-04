// states 三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(fn) {
  /// 默认pending状态
  this.state = PENDING;
  /// 初始化默认值
  this.value = null;
  /// 初始化理由
  this.reason = null;

  /// fulfilled 队列
  this.onFulfilledCallbacks = [];
  /// rejected 队列
  this.onRejectedCallbacks = [];

  var that = this;

  /// resolve
  function resolve(value) {
    if (that.state === PENDING) {
      that.state = FULFILLED;
      that.value = value;

      that.onFulfilledCallbacks.forEach((callback) => callback(that.value));
    }
  }
  /// reject
  function reject(reason) {
    if (that.state === PENDING) {
      that.state = REJECTED;
      that.reason = reason;

      that.onRejectedCallbacks.forEach((callback) => callback(that.reason));
    }
  }

  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
/// 返回值必须是promise
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var realOnFulfilled = onFulfilled;
  if (typeof realOnFulfilled !== "function") {
    realOnFulfilled = function (value) {
      return value;
    };
  }
  var realonRejected = onRejected;
  if (typeof realonRejected !== "function") {
    realonRejected = function (reason) {
      throw reason;
    };
  }
  var that = this;

  if (this.state === PENDING) {
    var promise2 = new MyPromise(function (resolve, reject) {
      that.onFulfilledCallbacks.push(function () {
        setTimeout(function () {
          try {
            var x = realOnFulfilled(that.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
      that.onRejectedCallbacks.push(function () {
        setTimeout(function () {
          try {
            var x = realonRejected(that.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
    });
    return promise2;
  }

  if (this.state === FULFILLED) {
    var promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onFulfilled !== "function") {
            resolve(that.value);
          } else {
            var x = realOnFulfilled(that.value);
            //   resolve(that.value);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
      }, 0);
    });
    return promise2;
  }

  if (this.state === REJECTED) {
    var promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onRejected !== "function") {
            reject(that.reason);
          } else {
            //   realonRejected(that.reason);
            var x = realonRejected(that.reason);
            //   resolve(that.reason);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
      }, 0);
    });
    return promise2;
  }
};

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(
      new TypeError("The promise and the return value are the same")
    );
  }

  if (x instanceof MyPromise) {
    x.then(function (y) {
      resolvePromise(promise, y, resolve, reject);
    }, reject);
  } else if (typeof x === "function" || typeof x === "object") {
    if (x === null) {
      return resolve(x);
    }

    try {
      var then = x.then;
    } catch (e) {
      return reject(e);
    }

    if (typeof then === "function") {
      var called = false;

      try {
        then.call(
          x,
          function (y) {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          function (e) {
            if (called) return;
            called = true;
            reject(e);
          }
        );
      } catch (e) {
        if (called) return;
        reject(e);
      }
    } else {
      resolve(x);
    }
  } else {
    resolve(x);
  }
}

MyPromise.deferred = function () {
  var result = {};
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

module.exports = MyPromise;
