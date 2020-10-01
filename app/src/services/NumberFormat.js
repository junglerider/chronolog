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
  ['INR', '₹'],
  ['BRL', '₹R$'],
  ['CAD', '₹$'],
  ['AUD', '₹$'],
  ['RUB', '₽'],
  ['THB', '฿'],
  ['KRW', '₩']
])

export default class NumberFormat {

  constructor(locale, currency = '') {
    this.locale = locale
    this.currencySign = currencySigns.has(currency) ? currencySigns.get(currency) : currency
    this.thousandsSeparator = thousandsSeparators.has(locale) ? thousandsSeparators.get(locale) : ','
    this.decimalPoint = decimalPoints.has(locale) ? decimalPoints.get(locale) : '.'
  }

  format(num) {
    if (num === null || num === undefined) return num
    num = num.toFixed(2).replace('.', this.decimalPoint)
    return num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${this.thousandsSeparator}`)
  }

  formatAmount(num) {
    return ['en', 'it'].includes(this.locale) ?
      this.currencySign + this.format(num) :
      this.format(num) + ' ' + this.currencySign
  }

  parse(str) {
    if (!str) return str
    str = str.replaceAll(this.thousandsSeparator, '')
    return Number(str.replace(this.decimalPoint, '.'))
  }
}
