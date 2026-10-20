import { createApp, watch } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import router from './router'

const app = createApp(App)
app.use(vuetify)
app.use(i18n)
app.use(router)

watch(() => app.config.globalProperties.$getLanguage(), language => {
  vuetify.locale.current.value = language
}, { immediate: true })

app.mount('#app')
