const MSPDAY = 86400000

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

}