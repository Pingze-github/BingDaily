
const path = require('path');

const config = {
  api: {
    base: 'https://cn.bing.com',
    daily: 'https://cn.bing.com/cnhp/life',
    wallpaper: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
  },
  setWallpaperWin: path.resolve(__dirname, '../setWallpaper_win/main.exe')
};

module.exports = config;
