
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const logger = require('./utils/logger');
const { getDaily, getWallpaper } = require('./lib/getSources');
const setWallpaper = require('./lib/setWallpaper');
const download = require('./lib/download');


global.config = require('./config');

logger();

process.on('unhandledRejection', (rej) => {
  console.error(rej);
});

try {
  fs.mkdirSync(config.baseDir);
} catch (e) {
  if (e.code !== 'EEXIST') {
    console.error(e);
    process.exit();
  }
}

if (require('electron-squirrel-startup')) { // eslint-disable-line
  app.quit();
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: '每日必应',
    width: 455,
    height: 600,
    backgroundColor: '#222222',
    opacity: 1,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('html', (event, date) => {
  date = date instanceof Date ? date : new Date(date || new Date());
  // Promise.all([getDaily(date), getWallpaper(date)]).then(res => console.log(res));
  getDaily(date).then(html => {
    console.log('[api.daily][FETCHED]', date.toLocaleDateString());
    event.sender.send('html', { html });
  });
});

ipcMain.on('apply', (event, date) => {
  date = date instanceof Date ? date : new Date(date || new Date());
  getWallpaper(date).then(imageInfo => {
    console.log('[apply] start fetch', date);
    const imgUrl = config.api.base + imageInfo.url;
    const downPath = path.resolve(config.baseDir, path.basename(imageInfo.url));
    console.log('[apply] Wallpaper info fetched: ', imageInfo);
    download(imgUrl, downPath).then(outPath => {
      console.log('[apply] Wallpaper downloaded:', imgUrl);
      setWallpaper(outPath).then((succeed) => {
        if (succeed) {
          console.log('[apply] Wallpaper applied:', outPath);
        } else {
          console.log('[apply][WARN] Wallpaper applying failed');
        }
      });
    }).catch((err) => {
      console.warn('[apply][WARN] Dowanload wallpaper failed:', imgUrl);
      console.warn(err);
    });
  });
});

// TODO 失败重试 尽量加快加载速度
// TODO daily html 缓存

// cheerio整理页面内容
//  增加浏览其他天数的功能

// 增加下载和设置壁纸的功能

//  获取指定日期的壁纸和内容

// TODO 将 左右箭头和日期 合并入datepicker 并优化显示

// 壁纸分辨率 1920x1080 1280x720 1366x768

// TODO 储存机制，将图片保存于本地。优先从本地查找。不保存bmp。
// TODO 历史图片使用bing今日美图网站的资源
