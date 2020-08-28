let i18nCatalog = new Map()
let currentLocale = 'en'
import('../i18n/en').then(catalog => {
  i18nCatalog = catalog.default
})

export default {
  install(Vue) {

    const i18n = function(sourceStr) {
      if (typeof sourceStr !== 'string') {
        return sourceStr
      }
      let translatedStr = i18nCatalog.has(sourceStr) ? i18nCatalog.get(sourceStr) : sourceStr
      for (let i = 1; i < arguments.length; i++) {
        translatedStr = translatedStr.replace(`{${i}}`, String(arguments[i]))
      }
      return translatedStr
    }

    const i18nDate = value => {
      if (typeof value !== 'string') {
        return value
      }
      const matches = value.match(/^(\d{4}-[01]\d-[0-3]\d)(\D[0-2]\d:[0-5]\d(:[0-5]\d)?)?(\.\d+([+-][0-2]\d:[0-5]\d|Z))?$/)
      if (!matches) {
        return value
      }
      const [year, month, day] = matches[1].split('-')
      const date = currentLocale === 'de' ?
        `${day}.${month}.${year}` :
        `${day}/${month}/${year}`
      const time = matches[2] ? ' ' + matches[2].substr(1) : ''
      return date + time
    }

    const $i18nDecToHrs = hrs => {
      const hours = Math.floor(Math.abs(hrs))
      const mins = Math.round((Math.abs(hrs) - hours) * 60)
      return hours + ':' + (mins > 9 ? '' : '0') + mins
    }

    Vue.filter('i18n', i18n)
    Vue.filter('i18nDate', i18nDate)

    Vue.prototype.$i18n = i18n
    Vue.prototype.$i18nDate = i18nDate
    Vue.prototype.$i18nDecToHrs = $i18nDecToHrs

    Vue.prototype.$getLanguage = () => currentLocale

    Vue.prototype.$setLanguage = locale => {
      return import(`../i18n/${locale}`).then(catalog => {
        i18nCatalog = catalog.default
        currentLocale = locale
      })
    }
  }
}