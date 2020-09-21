const thousandsSeparators = new Map([
  ['en', ','],
  ['de', '.'],
  ['fr', ' '],
  ['es', '.'],
  ['it', '.'],
])

const decimalPoints = new Map([
  ['en', '.'],
  ['de', ','],
  ['fr', ','],
  ['es', ','],
  ['it', ','],
])

const currencySigns = new Map([
  ['USD', '$'],
  ['EUR', '€'],
  ['GBP', '£'],
  ['CNY', '¥'],
  ['JPY', '¥'],
  ['THB', '฿'],
])

export default class NumberFormat {

  constructor(locale, currency = '') {
    this.currencySign = currencySigns.has(currency) ? currencySigns.get(currency) : currency
    this.thousandsSeparator = thousandsSeparators.has(locale) ? thousandsSeparators.get(locale) : ','
    this.decimalPoint = decimalPoints.has(locale) ? decimalPoints.get(locale) : '.'
  }

  format(num) {
    num = num.toFixed(2).replace('.', this.decimalPoint)
    return num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${this.thousandsSeparator}`)
  }

  unformat(str) {
    str = str.replaceAll(this.thousandsSeparator, '')
    return Number(str.replace(this.decimalPoint, '.'))
  }
}
