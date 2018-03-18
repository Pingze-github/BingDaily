
const os = require('os');
const path = require('path');
const fs = require('fs');
const request = require('request');

function download(url, outPath) {
  outPath = outPath || path.resolve(os.homedir(), path.basename(url));
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outPath);
    request(url).pipe(stream);
    resolve(outPath);
  });
}

module.exports = download;