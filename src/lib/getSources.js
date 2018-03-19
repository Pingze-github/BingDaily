
const cheerio = require('cheerio');
const request = require('../utils/request2');

function pad(str, num, padChar = '0') {
  str = '' + str;
  if (str.length >= num) return str;
  return padChar.repeat(num - str.length) + str;
}

async function getDaily(date) {
  date = date instanceof Date ? date : new Date(date);
  date = date || new Date();
  let dateStr = '';
  dateStr += date.getFullYear();
  dateStr += pad((date.getMonth() + 1), 2);
  dateStr += pad(date.getDate(), 2);

  const res = await request({
    url: config.api.daily,
    query: {
      currentDate: +dateStr,
    },
  });
  const html = res.body;
  const $ = cheerio.load(html);
  $('#hplaDL').css('display', 'none');
  $('#hpBingAppQR').css('display', 'none');
  $('.hplaCopy').css('margin-bottom', '15px');
  return $.html();
}

async function getWallpaper(date) {
  date = date instanceof Date ? date : new Date(date);
  const dateToday = new Date();
  date.setHours(0, 0, 0, 0);
  dateToday.setHours(0, 0, 0, 0);
  const offsetDate = (dateToday - date) / (86400000);
  const res = await request({
    url: config.api.wallpaper,
    query: {
      idx: offsetDate,
    },
  });
  return JSON.parse(res.body).images[0];
}


module.exports = {
  getDaily,
  getWallpaper,
};
