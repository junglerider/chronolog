let i18nCatalog = new Map()
let currentLocale = 'en'
import('../i18n/en').then(catalog => {
  i18nCatalog = catalog.default
})

export default {
  install(Vue) {

    const i18n = translationKey => {
      if (typeof translationKey !== 'string') {
        return translationKey
      }
      return i18nCatalog.has(translationKey) ? i18nCatalog.get(translationKey) : translationKey
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

    Vue.filter('i18n', i18n)
    Vue.filter('i18nDate', i18nDate)

    Vue.prototype.$i18n = i18n
    Vue.prototype.$i18nDate = i18nDate

    Vue.prototype.$getLanguage = () => currentLocale

    Vue.prototype.$setLanguage = locale => {
      if (currentLocale) {
        console.log(`Locale changed from ${currentLocale} to ${locale}`)
      }
      return import(`../i18n/${locale}`).then(catalog => {
        i18nCatalog = catalog.default
        currentLocale = locale
      })
    }
  }
}