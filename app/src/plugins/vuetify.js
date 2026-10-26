import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { de, en, es, fr, it } from 'vuetify/locale'
import { loadThemePreference } from '../services/theme'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: { ...aliases, warning: 'mdi-exclamation', error: 'mdi-alert', info: 'mdi-information', success: 'mdi-check-circle' },
    sets: { mdi }
  },
  theme: {
    defaultTheme: loadThemePreference(),
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          background: '#0d1117',
          surface: '#161b22',
          'surface-bright': '#424242',
          'surface-light': '#383838',
          'surface-variant': '#383838',
          'on-background': '#c9d1d9',
          'on-surface': '#E6E6E6',
          'on-surface-variant': '#DDDDDD'
        }
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
