
global.config = require('./src/config');

process.on('unhandledRejection', (rej) => {
  console.error(rej);
});

// ~async function () {
//   const {getDaily, getWallpaper} = require('./src/lib/getSources');
//   console.log(await getWallpaper(new Date().setDate(16)));
//   console.log(await getDaily(new Date().setDate(16)));
//
// }();

// ~function () {
//   const year = 2019;
//   const month = 2;
//
//   function getMaxDay(year, month) {
//     const day = new Date(`${year}-${month}-31`).getDate();
//     if (day === 31) return 31;
//     return 31 - day;
//   }
//
//   console.log(getMaxDay(year, month));
// }();

// ~function(){
//
//   const EventEmitter  = require('events').EventEmitter
//
//   class ABC extends EventEmitter {
//     constructor() {
//       super();
//     }
//     start() {
//       console.log('abc start');
//       setTimeout(() => {
//         this.emit('finish', 'abc end');
//       }, 2000);
//     }
//   }
//
//   let abc = new ABC();
//   abc.on('finish', (data) => {
//     console.log('finish', data)
//   });
//   abc.on('start', (data) => {
//     console.log('start', data)
//   });
//   abc.start();
//
// }();

// ~async function () {
//   const set = require('./src/lib/setWallpaper');
//   set('D:\\Pictures\\wp.bmp')
// }();

~async function () {
  const down = require('./src/lib/download');
  down('https://cn.bing.com' + '/az/hprichbg/rb/XmasTreeRoad_ZH-CN11556502034_1920x1080.jpg').then((out) => {
    console.log(out);
  })
}();