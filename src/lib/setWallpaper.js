
const exec = require('child_process').exec;

function setWallpaper(imgPath) {
  return new Promise((resolve, reject) => {
    exec(`${config.setWallpaperWin} ${imgPath}`, (err, out) => {
      if (err) return reject(err);
      if (+out === 1) {
        return resolve(true);
      }
      resolve(false);
    });
  });
}

module.exports = setWallpaper;
