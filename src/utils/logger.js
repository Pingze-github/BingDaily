
const util = require('util');

const levels = ['log', 'info', 'warn', 'error'];

const colorCodeMap = {
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  purple: 35,
  cyan: 36,
  gray: 37,
};

const levelColorMap = {
  info: 'green',
  warn: 'yellow',
  error: 'red',
};

function coloring(str, color) {
  const colorCode = colorCodeMap[color];
  return `\x1b[${colorCode}m${str}\x1b[0m`;
}

function getTimeString() {
  function pad(num, n) {
    num = ~~num;
    return Array((n - num.toString().length + 1)).join(0) + num;
  }
  const now = new Date();
  return `${pad(now.getHours(), 2)}:${pad(now.getMinutes(), 2)}:`
    + `${pad(now.getSeconds(), 2)}:${pad(now.getMilliseconds(), 3)}`;
}

module.exports = (options) => {
  options = options || { console: true };
  for (let level of levels) {
    global.console[level] = (...args) => {
      if (!options.console && !options.file) {
        return;
      }
      level = level === 'log' ? 'info' : level;
      const prefix = `[${getTimeString()}]`;
      const levelStr = `[${level.toUpperCase()}]`;
      const base = util.format.apply(null, args) + '\n';
      const color = levelColorMap[level];
      const output = coloring(prefix + levelStr + ' - ', color) + base;
      if (options.console) {
        process.stdout.write(output);
      }
      if (options.file) {
        require('fs').appendFile(options.file, prefix + levelStr + ' ' + base, 'utf-8', () => {});
      }
    };
  }
};
