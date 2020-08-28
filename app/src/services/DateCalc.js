const MSPDAY = 86400000

const pad = (num, length = 2) => {
  return String(num).padStart(length, '0')
}

// formats current or given date in YYYY-MM-DD[ HH:MM:SS] format
// using local date/time, not UTC!
const isoDate = (date, withHours) => {
  if (!date) {
    date = new Date()
  } else if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date)
  } else if (typeof date !== 'object' || typeof date.getMonth !== 'function') {
    return date
  }
  let isoStr = date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate())
  if (withHours) {
    isoStr += ' ' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds())
  }
  return isoStr
}

export default class DateCalc {

  static lastDayOfMonth(d) {
    const date = new Date(d.getTime())
    date.setMonth(date.getMonth() + 1)
    date.setDate(0)
    return date
  }

  static firstDayOfMonth(d) {
    const date = new Date(d.getTime())
    date.setDate(1)
    return date
  }

  static firstDayOfWeek(d) {
    const date = new Date(d.getTime())
    let day = date.getDay() - 1
    if (day < 0) day = 0
    if (day != 0)
      date.setTime(date.getTime() - (day * MSPDAY))
    return date
  }

  static lastDayOfWeek(d) {
    const date = new Date(d.getTime())
    let day = date.getDay() - 1
    if (day < 0) day = 0
    day = 6 - day
    if (day != 0)
      date.setTime(date.getTime() + (day * MSPDAY))
    return date
  }

  static getTimeString(d, style = 'medium') {
    const date = d || new Date()
    return date.toLocaleString('en', {timeStyle: style, hour12: false})
  }

  static getWeekdayString(d, style = 'long') {
    const date = d || new Date()
    return date.toLocaleString('en', {weekday: style})
  }

  static getTimeZoneString(d) {
    const date = d || new Date()
    return date.toLocaleString('en', {timeZoneName: 'long', hour12: false}).substr(20)
  }

  static hhmmssToSec(timeString) {
    const parts = timeString.split(':').map(p => parseInt(p))
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  static secToHhmmss(sec) {
    const hours  = Math.floor(sec / 3600)
    const minutes = Math.floor((sec - (hours * 3600)) / 60)
    const seconds = sec - (hours * 3600) - (minutes * 60)
    return [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':')
  }

  static isoDate(date = undefined) {
    return isoDate(date, false)
  }

  static isoDateTime(date = undefined) {
    return isoDate(date, true)
  }

}