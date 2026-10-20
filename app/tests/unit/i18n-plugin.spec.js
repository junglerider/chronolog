import i18nPlugin from '../../src/plugins/i18n'

describe('i18n plugin', () => {
  it('registers globals on a Vue 2 constructor', async () => {
    const Vue = {
      prototype: {}
    }

    i18nPlugin.install(Vue)
    await Vue.prototype.$setLanguage('en')

    expect(Vue.prototype.$i18n('Login')).toBe('Login')
    expect(Vue.prototype.$getLanguage()).toBe('en')
  })

  it('registers globals on a Vue 3 application', async () => {
    const application = {
      config: {
        globalProperties: {}
      }
    }

    i18nPlugin.install(application)
    await application.config.globalProperties.$setLanguage('de')

    expect(application.config.globalProperties.$i18n('Login')).toBe('Anmelden')
    expect(application.config.globalProperties.$i18nDate('2026-10-20')).toBe('20.10.2026')
    expect(application.config.globalProperties.$getLanguage()).toBe('de')
  })
})
