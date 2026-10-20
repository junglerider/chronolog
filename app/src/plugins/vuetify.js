import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { de, en, es, fr, it } from 'vuetify/locale'

export default createVuetify({
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { de, en, es, fr, it }
  },
  defaults: {
    VTextField: { variant: 'underlined' },
    VTextarea: { variant: 'underlined' },
    VSelect: { variant: 'underlined' },
    VAutocomplete: { variant: 'underlined' },
    VCombobox: { variant: 'underlined' }
  }
})
