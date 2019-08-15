import View from 'BobjollView';
import { qq, delegate } from '../library/dom';
import { endOfMonth, eachDay, getDay, format, startOfDay, isEqual } from 'date-fns';
const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AM = 'AM';
const PM = 'PM';
export class DateTimePicker {

  private static readonly templateExt = View.ext;
  private static readonly template = require(`BobjollTemplate/datetimepicker-v1.0/element.${DateTimePicker.templateExt}`);
  static readonly inputPickerClass = '.datetimepickerbj';
  static readonly calendarContainerClass = '.calendar-div';
  private format: string = 'YYYY-MM-DD';//'YYYY-MM-DD h:i:s';
  private name: string;
  private width: string;
  private value: Date;
  private id: string;
  private firstDayOfWeek: string = "1";
  private date: Date;
  private hideCal: boolean = true;
  private activePort: null = null;
  private timeStamp: Date = new Date();
  private monthIndex: number;
  private hourIndex: number;
  private minuteIndex: number;
  private year: number = 2017;
  private portsHolder: Array<string> = [];
  private minute: string = '00';
  private hour: string = '01';
  private day: number = 1;
  private minuteSelectorVisible: boolean = false;
  private hourSelectorVisible: boolean = false;
  private period: string = new Date().getHours() > 11 ? PM : AM;
  private isCalendarClicked: boolean = false;
  private weeks: Array<String> = [];
  private days: Array<String> = [];
  private element: any;
  private periodStyle: number | null;

  constructor(options) {
    this.element = options.datetimepicker;
    this.value = this.element.value.length ? new Date(this.element.value) : new Date();
    this.date = this.value;

    if (this.element.dataset.format) {
      this.format = this.element.dataset.format;
    } else {
      this.element.dataset.format = this.format;
    }
    this.monthIndex = this.element.dataset.monthIndex ? this.element.dataset.monthIndex : 0;
    this.hourIndex = this.element.dataset.hourIndex ? this.element.dataset.hourIndex : 0;
    this.minuteIndex = this.element.dataset.minuteIndex ? this.element.dataset.minuteIndex : 0;
    this.id = this.element.id ? this.element.id : 'datetimebj';

    this.portsHolder = this.setPorts();

    this.created();

  }

  private render() {
    this.element.insertAdjacentHTML('afterend',
      View.render(DateTimePicker.template, {
        options: this,
        id: this.id,
        dataset: this.element.dataset
      })
    );
  }

  private updateActivePortFromWeek(week, weekIndex) {
    const currentActive = startOfDay(this.timeStamp);
    const index = week.findIndex(day => isEqual(currentActive, day));
    if (index !== -1) {
      this.activePort = weekIndex * 7 + index;
    }
  }

  static updateCalendar(calendar) {
    const date = new Date(calendar.dataset.year, months.indexOf(calendar.dataset.month));
    let weeks = [];
    let week = null;
    let weekDays = new Array(7);
    eachDay(date, endOfMonth(date)).forEach(day => {
      const weekday = getDay(day);
      if (weekday === 1) {
        if (week) {
          weeks.push(week);
          weekDays = new Array(7);
        }
        week = new Array(7);
      } else if (week === null) {
        week = new Array(7);
      }
      const idx = (weekday - 1 + 7) % 7;
      week[idx] = format(day, 'DD');
      weekDays[idx] = day;
    });
    if (week && week.some(n => n)) {
      weeks.push(week);
      // this.updateActivePortFromWeek(weekDays, weeks.length - 1);
    }
    let weekContainer = calendar.querySelector('.week').parentNode;
    let currentWeeks = calendar.querySelectorAll('.week');
    calendar.querySelectorAll('.week').forEach((week, index) => {
      weekContainer.removeChild(week);
    });

    for (let newWeek in weeks) {
      let divWeek = document.createElement('div');
      divWeek.setAttribute('class', 'week');
      for (let day = 0; day < weeks[newWeek].length; day++) {
        let spanPort = document.createElement('span');
        spanPort.setAttribute('class', 'port');
        spanPort.innerText = typeof weeks[newWeek][day] !== 'undefined' ? weeks[newWeek][day] : '';
        divWeek.appendChild(spanPort);
        divWeek.append('\n');
      }
      weekContainer.appendChild(divWeek);
    }
  }

  private updateCalendar() {
    const date = new Date(this.year, this.monthIndex, 1, 0, 0, 0);
    const weeks = [];
    let week = null;
    let weekDays = new Array(7);
    // let index = 0;
    this.activePort = null;
    eachDay(date, endOfMonth(date)).forEach(day => {
      const weekday = getDay(day);
      if (weekday === this.normalizedFirstDayOfWeek()) {
        if (week) {
          weeks.push(week);
          // Add those days that were not part of the month to the index
          // index += week.filter(d => d === null).length;
          this.updateActivePortFromWeek(weekDays, weeks.length - 1);
          weekDays = new Array(7);
        }
        week = new Array(7);
      } else if (week === null) {
        week = new Array(7);
      }
      const idx = (weekday - this.normalizedFirstDayOfWeek() + 7) % 7
      week[idx] = format(day, 'DD');
      weekDays[idx] = day;
    });
    if (week && week.some(n => n)) {
      weeks.push(week);
      this.updateActivePortFromWeek(weekDays, weeks.length - 1);
    }
    this.weeks = weeks;
  }
  private setDay(index, port) {
    if (port) {
      this.activePort = index;
      this.day = parseInt(port, 10);
      this.timeStamp = new Date(this.year, this.monthIndex, this.day);
    }
  }
  private setMinute(index, closeAfterSet) {
    this.minuteIndex = index
    this.minute = this.minutes[index]
    if (closeAfterSet) {
      this.minuteSelectorVisible = false
    }
  }
  private setHour(index, closeAfterSet) {
    this.hourIndex = index
    this.hour = this.hours[index]
    if (closeAfterSet) {
      this.hourSelectorVisible = false
    }
  }
  private showHourSelector() {
    this.hourSelectorVisible = true
    this.minuteSelectorVisible = false
  }
  private showMinuteSelector() {
    this.minuteSelectorVisible = true
    this.hourSelectorVisible = false
  }
  private keyIsDown(event) {
    let key = event.which || event.keycode
    if (key === 38) {
      if (this.minuteSelectorVisible && this.minuteIndex > 0) {
        this.setMinute(this.minuteIndex - 1, false)
        this.scrollTopMinute()
      } else if (this.hourSelectorVisible && this.hourIndex > 0) {
        this.setHour(this.hourIndex - 1, false)
        this.scrollTopHour()
      }
    } else if (key === 40) {
      if (this.minuteSelectorVisible && this.minuteIndex < this.minutes.length - 1) {
        this.setMinute(this.minuteIndex + 1, false)
        this.scrollTopMinute()
      } else if (this.hourSelectorVisible && this.hourIndex < this.hours.length - 1) {
        this.setHour(this.hourIndex + 1, false)
        this.scrollTopHour()
      }
    } else if (key === 13) {
      this.minuteSelectorVisible = false
      this.hourSelectorVisible = false
    }
    if (this.minuteSelectorVisible || this.hourSelectorVisible) {
      event.preventDefault()
      this.minuteSelectorVisible = false
      this.hourSelectorVisible = false
    }
  }
  private scrollTopMinute() {
    // let mHeight = this.$refs.minuteScroller.scrollHeight
    // let wHeight = this.$refs.minuteScrollerWrapper.clientHeight
    let calendarDiv = this.element.nextElementSibling;
    let minuteSelector = calendarDiv.querySelector('.minute-selector');
    let mHeight = minuteSelector.querySelector('ul').scrollHeight;
    let wHeight = minuteSelector.querySelector('.scroll-hider').clientHeight;
    let top = mHeight * (this.minuteIndex / (this.minutes.length - 1)) - (wHeight / 2)
    minuteSelector.querySelector('ul').scrollTop = top
  }
  private scrollTopHour() {
    // let mHeight = this.$refs.hourScroller.scrollHeight
    // let wHeight = this.$refs.hourScrollerWrapper.clientHeight
    let calendarDiv = this.element.nextElementSibling;
    let hourSelector = calendarDiv.querySelector('.hour-selector');
    let mHeight = hourSelector.querySelector('ul').scrollHeight;
    let wHeight = hourSelector.querySelector('.scroll-hider').clientHeight;
    let top = mHeight * (this.hourIndex / (this.hours.length - 1)) - (wHeight / 2)
    hourSelector.querySelector('ul').scrollTop = top
  }
  private changePeriod() {
    this.period = this.period === AM ? PM : AM
  }
  private documentClicked(event) {
    event.cancelBubble = true

    if (event.target.id == this.id && this.hideCal) {
      this.isCalendarClicked = true;
      this.hideCal = false;
    } else if (!DateTimePicker.hasSomeParentTheClass(event.target, DateTimePicker.calendarContainerClass) && !this.hideCal) {
      this.minuteSelectorVisible = false;
      this.hourSelectorVisible = false;
      this.setDate();
    } else if (event.target.id !== this.id && event.target.id !== 'j-hour' && event.target.id !== 'j-minute' && this.isCalendarClicked) {
      this.minuteSelectorVisible = false;
      this.hourSelectorVisible = false;
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  static setDate(e) {
    let d = null;
    let portSpan = e.target;
    let day = parseInt(portSpan.innerHTML);
    if (!isNaN(day)) {
      let d = null;
      let formattedDate = 'YYYY-MM-DD';
      let inputPicker = DateTimePicker.hasSomeParentTheClass(portSpan, DateTimePicker.inputPickerClass);
      if(inputPicker !== false) {
        let calendarContainer = inputPicker.parentNode.querySelector(DateTimePicker.calendarContainerClass);
        d = inputPicker.dataset.format;
        d = d.replace('YYYY', calendarContainer.dataset.year.toString());
        d = d.replace('DD', (day < 10 ? '0' + day : day).toString());
        let m = months.indexOf(calendarContainer.dataset.month) + 1;
        d = d.replace('MM', (m < 10 ? '0' + m : m).toString());
        formattedDate = formattedDate
        .replace('YYYY', calendarContainer.dataset.year.toString())
        .replace('DD', (day < 10 ? '0' + day : day).toString())
        .replace('MM', (m < 10 ? '0' + m : m).toString());
        // this.minute += '';
        // d = d.replace(this.periodStyle === 24 ? 'H' : 'h', h.length < 2 ? '0' + h : '' + h);
        // d = d.replace('i', this.minute.length < 2 ? '0' + this.minute : '' + this.minute);
        // d = d.replace('s', '00');
        inputPicker.value = d;
        calendarContainer.classList.toggle('noDisplay');
        inputPicker.dispatchEvent(new Event('change'));
      }
    }

  }
  private setDate(hide: boolean = true) {
    let d = null
    let formattedDate = 'YYYY-MM-DD';
    if (this.dateFormat().indexOf('H') !== -1) {
      this.periodStyle = 24;
      this.period = null;
    } else {
      this.periodStyle = 12;
    }
    let h: string | number = this.hour + ''
    if (this.periodStyle === 12) {
      if (h === '12') {
        h = this.period === AM ? '00' : '12'
      } else if (this.period === PM && parseInt(h) < 12) {
        h = parseInt(h) + 12
        h = '' + h
      } else if (this.period === AM && parseInt(h) > 12) {
        h = parseInt(h) - 12
        h = '' + h
      }
    }
    d = this.dateFormat();
    d = d.replace('YYYY', this.year.toString());
    d = d.replace('DD', (this.day < 10 ? '0' + this.day : this.day).toString());
    let m = this.monthIndex + 1;
    d = d.replace('MM', (m < 10 ? '0' + m : m).toString());
    formattedDate = formattedDate
      .replace('YYYY', this.year.toString())
      .replace('DD', (this.day < 10 ? '0' + this.day : this.day).toString())
      .replace('MM', (m < 10 ? '0' + m : m).toString());
    this.minute += '';
    d = d.replace(this.periodStyle === 24 ? 'H' : 'h', h.length < 2 ? '0' + h : '' + h);
    d = d.replace('i', this.minute.length < 2 ? '0' + this.minute : '' + this.minute);
    d = d.replace('s', '00');
    this.element.value = d;
  }
  /**
  `*Creates a date object from a given date string
  */
  private makeDateObject(val) {
    // handle support for eu date format
    let dateAndTime = val.split(' ');
    let arr = []
    if (this.format.indexOf('-') !== -1) {
      arr = dateAndTime[0].split('-')
    } else {
      arr = dateAndTime[0].split('/')
    }
    let year: number = 0
    let month: number = 0
    let day: number = 0
    if (this.format.indexOf('DD/MM/YYYY') === 0 || this.format.indexOf('DD-MM-YYYY') === 0) {
      year = parseInt(arr[2])
      month = parseInt(arr[1])
      day = parseInt(arr[0])
    } else if (this.format.indexOf('YYYY/MM/DD') === 0 || this.format.indexOf('YYYY-MM-DD') === 0) {
      year = parseInt(arr[0])
      month = parseInt(arr[1])
      day = parseInt(arr[2])
    } else {
      year = parseInt(arr[2])
      month = parseInt(arr[0])
      day = parseInt(arr[1])
    }
    let date = new Date();
    if (this.hideDate) {
      // time only
      var splitTime = dateAndTime[0].split(':')
      date.setHours(parseInt(splitTime[0]), parseInt(splitTime[1]), parseInt(splitTime[2]), 0)
    } else if (this.hideTime) {
      // date only
      date = new Date(year, month - 1, day)
    } else {
      // we have both date and time
      var splitTime = dateAndTime[1].split(':')
      date = new Date(year, month - 1, day, parseInt(splitTime[0]), parseInt(splitTime[1]), parseInt(splitTime[2]))
    }
    return date
  }

  static hasSomeParentTheClass(element, classname) {
    //
    // If we are here we didn't find the searched class in any parents node
    //
    if (!element.parentNode) return false;
    //
    // If the current node has the class return true, otherwise we will search
    // it in the parent node
    //
    if (classname.indexOf('.') === -1 || classname.indexOf('.') !== 0) {
      classname = '.' + classname;
    }
    if (element.querySelectorAll(classname).length > 0) return element.querySelector(classname);
    return DateTimePicker.hasSomeParentTheClass(element.parentNode, classname);
  }

  private normalizedFirstDayOfWeek() {
    return parseInt(this.firstDayOfWeek, 10);
  }

  private changeValue(newVal: string) {
    if (newVal) {
      this.value = new Date(newVal);
      try {
        this.timeStamp = this.value;
      } catch (e) {
        console.warn(e.message + '. Current date is being used.');
        this.timeStamp = new Date();
      }
    }

    this.year = this.timeStamp.getFullYear();
    this.monthIndex = this.timeStamp.getMonth();
    this.day = this.timeStamp.getDate();
    let hourNumber = this.timeStamp.getHours();
    this.hour = hourNumber < 10 ? '0' + hourNumber : '' + hourNumber;
    let minuteNumber = this.timeStamp.getMinutes();
    this.minute = minuteNumber < 10 ? '0' + minuteNumber : '' + minuteNumber;
    this.updateCalendar();
    this.setDate(false);
  }


  private created() {
    if (this.value) {
      try {
        this.timeStamp = this.value;
        // set #period (am or pm) based on date hour
        if (this.timeStamp.getHours() >= 12) {
          this.period = PM
        } else {
          this.period = AM
        }
      } catch (e) {
        console.warn(e);
        this.timeStamp = new Date()
      }
    }
    this.year = this.timeStamp.getFullYear()
    this.monthIndex = this.timeStamp.getMonth()
    this.day = this.timeStamp.getDate()
    let hourNumber = this.timeStamp.getHours()
    this.hour = hourNumber < 10 ? '0' + hourNumber : '' + hourNumber
    let minuteNumber = this.timeStamp.getMinutes()
    this.minute = minuteNumber < 10 ? '0' + minuteNumber : '' + minuteNumber
    this.updateCalendar()
    days.forEach((day, idx) => {
      this.days[(idx - this.normalizedFirstDayOfWeek() + 7) % 7] = day;
    });

    this.render();
    delegate('.nav-yl', 'click', DateTimePicker.changeYear);
    delegate('.nav-yr', 'click', DateTimePicker.changeYear);
    delegate('.nav-ml', 'click', DateTimePicker.changeMonth);
    delegate('.nav-mr', 'click', DateTimePicker.changeMonth);
    delegate(DateTimePicker.inputPickerClass, 'click', DateTimePicker.toggleCalendar);
    delegate('.okButton', 'click', DateTimePicker.toggleCalendar);
    delegate('.port', 'click', DateTimePicker.setDate);
    if (this.value) {
      this.setDate(false);
    }
  }

  public static changeYear(e) {
    let calendar = e.target.closest(DateTimePicker.calendarContainerClass);
    let targetElement = e.target.parentNode.querySelector('.year');
    let newYear = parseInt(targetElement.innerHTML) + (e.target.classList.contains('nav-yl') ? - 1 : + 1);
    calendar.dataset.year = newYear;
    targetElement.innerHTML = newYear;
    DateTimePicker.updateCalendar(calendar);
  }

  public static changeMonth(e) {
    let calendar = e.target.closest(DateTimePicker.calendarContainerClass);
    let targetElement = e.target.parentNode.querySelector('.month');
    let newMonth = months.indexOf(targetElement.innerHTML) + (e.target.classList.contains('nav-ml') ? - 1 : + 1);
    if (newMonth > 11) {
      newMonth = 0;
    } else if (newMonth < 0) {
      newMonth = 11;
    }
    calendar.dataset.month = months[newMonth];
    targetElement.innerHTML = months[newMonth];
    DateTimePicker.updateCalendar(calendar);
  }

  public static toggleCalendar(e) {
    let calendarInput = e.target;
    let hasClassElement = DateTimePicker.hasSomeParentTheClass(calendarInput, DateTimePicker.calendarContainerClass);
    if (hasClassElement.classList.contains('noDisplay')) {
      document.querySelectorAll(DateTimePicker.calendarContainerClass).forEach(el => {
        if (!el.classList.contains('noDisplay')) {
          el.classList.toggle('noDisplay');
        }
      })
    }
    if (hasClassElement !== false && calendarInput.getAttribute('disabled') == null) {
      hasClassElement.classList.toggle('noDisplay');
    }

  }

  private dateFormat() {
    let f = 'YYYY-MM-DD h:i:s'
    let allowedFormats = [
      'YYYY-MM-DD h:i:s', 'DD-MM-YYYY h:i:s', 'MM-DD-YYYY h:i:s',
      'YYYY-MM-DD H:i:s', 'DD-MM-YYYY H:i:s', 'MM-DD-YYYY H:i:s',
      'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY',
      'YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'h:i:s', 'H:i:s',
      'YYYY/MM/DD h:i:s', 'DD/MM/YYYY h:i:s', 'MM/DD/YYYY h:i:s',
      'YYYY/MM/DD H:i:s', 'DD/MM/YYYY H:i:s', 'MM/DD/YYYY H:i:s'
    ]
    if (this.format) {
      f = this.format
    }
    if (allowedFormats.indexOf(f) < 0) {
      console.warn('Invalid date format supplied. Current default date format is being used.')
      // return default date format if date format is invalid
      return 'YYYY-MM-DD h:i:s'
    } else {
      return f
    }
  }

  private setPorts() {
    let p = [];
    if (this.portsHolder.length === 0) {
      for (let i = 0; i < 42; i++) {
        p.push('');
      }
    } else {
      p = this.portsHolder;
    }
    return p;
  }

  private month() {
    return months[this.monthIndex];
  }

  private dateTime() {
    return this.timeStamp.getFullYear() + '-' + (this.timeStamp.getMonth() + 1) + '-' + this.timeStamp.getUTCDay()
  }
  private minutes() {
    let arr = []
    for (let i = 0; i < 60; i++) {
      i < 10 ? arr.push('0' + i) : arr.push('' + i)
    }
    return arr
  }
  private hours() {
    let arr = []
    if (this.periodStyle === 24) {
      for (let i = 0; i < this.periodStyle; i++) {
        i < 10 ? arr.push('0' + i) : arr.push('' + i)
      }
    } else {
      for (let i = 1; i <= this.periodStyle; i++) {
        i < 10 ? arr.push('0' + i) : arr.push('' + i)
      }
    }
    return arr
  }
  private hideTime() {
    return this.dateFormat().indexOf('h:i:s') === -1 && this.dateFormat().indexOf('H:i:s') === -1
  }
  private hideDate() {
    return this.dateFormat() === 'h:i:s' || this.dateFormat() === 'H:i:s'
  }
}

qq(DateTimePicker.inputPickerClass).forEach(datetimepicker => new DateTimePicker({ datetimepicker }));