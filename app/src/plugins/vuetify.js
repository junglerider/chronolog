import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { de, en, es, fr, it } from 'vuetify/locale'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: { ...aliases, warning: 'mdi-exclamation', error: 'mdi-alert', info: 'mdi-information', success: 'mdi-check-circle' },
    sets: { mdi }
  },
  theme: {
    themes: {
      light: {
        colors: { primary: '#1976D2', secondary: '#424242', accent: '#82B1FF', error: '#FF5252', info: '#2196F3', success: '#4CAF50', warning: '#FB8C00' }
      }
    }
  },
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { de, en, es, fr, it }
  },
  defaults: {
    VAlert: { variant: 'tonal', border: false },
    VTextField: { variant: 'underlined', color: 'primary' },
    VTextarea: { variant: 'underlined', color: 'primary' },
    VSelect: { variant: 'underlined', color: 'primary' },
    VAutocomplete: { variant: 'underlined', color: 'primary' },
    VCombobox: { variant: 'underlined', color: 'primary' }
  }
})
