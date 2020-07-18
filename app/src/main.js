import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n'
import router from './router'

Vue.config.productionTip = false
Vue.use(i18n)

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
