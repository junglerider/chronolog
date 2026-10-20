import { decimalHoursToTime, formatDate, translate } from '../services/i18n'

const supportedLanguages = ['en', 'de', 'fr', 'es', 'it']
const languageCatalogs = {
  en: () => import('../i18n/en.js'),
  de: () => import('../i18n/de.js'),
  fr: () => import('../i18n/fr.js'),
  es: () => import('../i18n/es.js'),
  it: () => import('../i18n/it.js')
}
let i18nCatalog = new Map()
let currentLocale = 'en'

export default {
  install(application) {

    const i18n = (sourceStr, ...args) => translate(sourceStr, i18nCatalog, ...args)
    const i18nDate = value => formatDate(value, currentLocale)
    const $i18nDecToHrs = decimalHoursToTime

    const setLanguage = locale => {
      const loadCatalog = languageCatalogs[locale]
      if (!loadCatalog) {
        return Promise.reject(new Error(`Unsupported language: ${locale}`))
      }
      return loadCatalog().then(catalog => {
        i18nCatalog = catalog.default
        currentLocale = locale
        window.localStorage.setItem('language', locale)
      })
    }

    currentLocale = window.localStorage.getItem('language')
    if (!currentLocale || !supportedLanguages.includes(currentLocale)) {
      currentLocale = 'en'
    }

    const isVue3Application = Boolean(application.config?.globalProperties)
    const globalProperties = isVue3Application
      ? application.config.globalProperties
      : application.prototype

    globalProperties.$i18n = i18n
    globalProperties.$i18nDate = i18nDate
    globalProperties.$i18nDecToHrs = $i18nDecToHrs
    globalProperties.$setLanguage = setLanguage
    globalProperties.$getLanguage = () => currentLocale

    setLanguage(currentLocale)
  }
}