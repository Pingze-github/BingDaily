module.exports = promisify;

/**
 * 包装函数，返回Promise对象
 * @param fn
 * @param callbackErr
 * @param reverse
 * @returns {Function}
 */
function promisify(fn, callbackErr = true, reverse = false) {
  if ({}.toString.call(fn) !== '[object Function]') throw new TypeError('Only normal function can be promisified');
  return function (...args) {
    return new Promise((resolve, reject) => {
      const callback = function (..._args) {
        if (!callbackErr) {
          if (_args.length === 1) return resolve(_args[0]);
          return resolve(_args);
        }
        const err = _args.shift();
        const rest = _args;
        if ({}.toString.call(err) === '[object Error]') {
          // 此处为数据库err添加内容，以便调试
          if (err.code && err.code.startsWith('SQLITE')) {
            err.query = args[0];
          }
          return reject(err);
        }
        if (rest.length === 1) return resolve(rest[0]);
        return resolve(rest);
      };
      try {
        if (reverse === true) fn.apply(null, [callback, ...args]);
        else fn.apply(null, [...args, callback]);
      } catch (err) {
        reject(err);
      }
    });
  };
}
