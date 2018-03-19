
const request = require('../utils/request');

async function download(url, outPath) {
  try {
    await request({
      url,
      save: outPath,
      timeout: 6 * 1000,
    });
    return outPath;
  } catch (err) {
    console.error('[download]', err);
    return null;
  }
}

module.exports = download;
