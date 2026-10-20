import { shallowRef } from 'vue'
import { decimalHoursToTime, formatDate, translate } from '../services/i18n'

const supportedLanguages = ['en', 'de', 'fr', 'es', 'it']
const languageCatalogs = {
  en: () => import('../i18n/en.js'),
  de: () => import('../i18n/de.js'),
  fr: () => import('../i18n/fr.js'),
  es: () => import('../i18n/es.js'),
  it: () => import('../i18n/it.js')
}
const i18nCatalog = shallowRef(new Map())
const currentLocale = shallowRef('en')

export default {
  install(application) {

    const i18n = (sourceStr, ...args) => translate(sourceStr, i18nCatalog.value, ...args)
    const i18nDate = value => formatDate(value, currentLocale.value)
    const $i18nDecToHrs = decimalHoursToTime

    const setLanguage = locale => {
      const loadCatalog = languageCatalogs[locale]
      if (!loadCatalog) {
        return Promise.reject(new Error(`Unsupported language: ${locale}`))
      }
      return loadCatalog().then(catalog => {
        i18nCatalog.value = catalog.default
        currentLocale.value = locale
        window.localStorage.setItem('language', locale)
      })
    }

    const storedLocale = window.localStorage.getItem('language')
    currentLocale.value = supportedLanguages.includes(storedLocale) ? storedLocale : 'en'

    const globalProperties = application.config.globalProperties

    globalProperties.$i18n = i18n
    globalProperties.$i18nDate = i18nDate
    globalProperties.$i18nDecToHrs = $i18nDecToHrs
    globalProperties.$setLanguage = setLanguage
    globalProperties.$getLanguage = () => currentLocale.value

    setLanguage(currentLocale.value)
  }
}