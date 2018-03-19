
const EventEmitter = require('events').EventEmitter;

class DatePicker extends EventEmitter {
  constructor(date, options) {
    super();
    date = date || new Date();
    this.options = options || {};
    this.options.range = this.options.range || [new Date('2015-06-12'), new Date()];
    this.$base = $('.datepicker');
    this.$mask = $('.datepicker-mask');
    this.$numbers = {
      year: this.$base.find('.number[key="year"]'),
      month: this.$base.find('.number[key="month"]'),
      day: this.$base.find('.number[key="day"]'),
    };
    this.limitMap = {
      year: [2010, 2018, 'stay'],
      month: [1, 12, 'circle'],
      day: [1, 31, 'circle'],
    };
    this.init(date);
  }
  init(date) {
    this.set(date);
    this.bindEvents();
  }
  set(date) {
    date = date || new Date();
    this.$numbers.year.text(date.getFullYear());
    this.$numbers.month.text(date.getMonth() + 1);
    this.$numbers.day.text(date.getDate());
  }
  get(flag) {
    function asDate(dateShow) {
      return new Date(`${dateShow.year}-${dateShow.month}-${dateShow.day}`);
    }
    const year = +this.$numbers.year.text();
    const month = +this.$numbers.month.text();
    const day = +this.$numbers.day.text();
    if (flag === 'asObj') {
      return { year, month, day, asDate };
    }
    return new Date(`${year}-${month}-${day}`);
  }
  show() {
    this.$base.show();
    this.$mask.show();
  }
  hide() {
    this.$base.hide();
    this.$mask.hide();
    this.emit('hided');
  }
  static getMaxDay(year, month) {
    const day = new Date(`${year}-${month}-31`).getDate();
    if (day === 31) return 31;
    return 31 - day;
  }
  bindEvents() {
    this.$mask.click(() => {
      this.hide();
    });
    this.$base.find('.trigger').click((e) => {
      const $target = $(e.delegateTarget);
      const key = $target.attr('key');
      const $number = this.$numbers[key];
      let newNumber = +$number.text();
      if ($target.hasClass('up')) {
        newNumber -= 1;
      } else if ($target.hasClass('down')) {
        newNumber += 1;
      } else {
        return;
      }
      const dateShow = this.get('asObj');
      const limit = this.limitMap[key];
      // 日限制 跟随年月
      if (key === 'day') {
        limit[1] = DatePicker.getMaxDay(dateShow.year, dateShow.month);
      }
      if (newNumber < limit[0]) {
        if (limit[2] === 'circle') {
          newNumber = limit[1];
        } else {
          newNumber += 1;
        }
      } else if (newNumber > limit[1]) {
        if (limit[2] === 'circle') {
          newNumber = limit[0];
        } else {
          newNumber -= 1;
        }
      }
      dateShow[key] = newNumber;
      if (this.options.range) {
        const dateShowValue = dateShow.asDate(dateShow).setHours(0, 0, 0, 0);
        if (dateShowValue > this.options.range[1].setHours(0, 0, 0, 0)) {
          return this.set(this.options.range[1]);
        } else if (dateShowValue < this.options.range[0].setHours(0, 0, 0, 0)) {
          return this.set(this.options.range[0]);
        }
      }
      $number.text('' + newNumber);
      // 年月变动带动日变动
      if (key !== 'day') {
        const maxDay = DatePicker.getMaxDay(dateShow.year, dateShow.month);
        if (maxDay < dateShow.day) {
          this.$numbers.day.text('' + maxDay);
        }
      }
      this.emit('changed', this.get());
    });
  }
}

let dateGlob = new Date();
const { shell, ipcRenderer } = require('electron');
const $ = require('jquery');
const host = 'https://cn.bing.com';

$(document).ready(() => {
  const datePicker = new DatePicker(dateGlob);
  bindMenu();
  showDate(dateGlob);
  // 获取html
  ipcRenderer.on('html', (event, msg) => {
    showDate(dateGlob);
    $('.wrap').html(msg.html);
    bindWrap();
  });
  ipcRenderer.send('html');
  // 应用壁纸
  $('#apply').click(() => {
    ipcRenderer.send('apply', dateGlob);
  });
  function bindWrap() {
    const $a = $('.wrap a');
    $a.click((e) => {
      e.preventDefault();
      const $target = $(e.delegateTarget);
      if ($target.attr('origin')) return;
      const url = host + $target.attr('href');
      shell.openExternal(url);
    });
  }
  function bindMenu() {
    $('#prev').click(() => {
      jumpTo(new Date(dateGlob.setDate(dateGlob.getDate() - 1)));
    });
    $('#next').click(() => {
      jumpTo(new Date(dateGlob.setDate(dateGlob.getDate() + 1)));
    });
    $('#date').click(() => {
      datePicker.show();
    });
    // 使用事件机制
    datePicker.on('hided', () => {
      dateGlob = datePicker.get();
      jumpTo(dateGlob);
    });
  }
  function jumpTo(date) {
    ipcRenderer.send('html', date);
  }
  function showDate(date) {
    $('#date').text(date.toLocaleDateString());
  }
});

