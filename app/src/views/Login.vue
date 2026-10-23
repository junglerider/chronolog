<template>
  <v-app>
    <v-app-bar
      color="black"
      style="color: white; padding-left: 3vw;"
    >
      <v-toolbar-title class="app-title">chronolog</v-toolbar-title>
      <v-toolbar-title class="app-text">Time &amp; Project Management</v-toolbar-title>
      <v-spacer></v-spacer>
      <language-menu @changeLanguage="$forceUpdate()" />
    </v-app-bar>

    <v-form ref="form">
      <v-card :elevation="6" class="login-form" @keyup="keyControl">
        <div class="login-title">chronolog</div>
        <v-text-field
          v-model="username"
          :label="$i18n('User name')"
          :rules="requiredRule"
          ref="username"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :label="$i18n('Password')"
          :type="showPassword ? 'text' : 'password'"
        >
        <template #append-inner>
        <v-btn
          @click="showPassword = !showPassword"
          tabindex="-1"
          icon color="grey"

         variant="text" size="small">
          <v-icon v-if="showPassword" >mdi-eye</v-icon>
          <v-icon v-if="!showPassword" >mdi-eye-off</v-icon>
        </v-btn>
        </template>
        </v-text-field>
        <v-alert v-model="authError" type="error" variant="tonal">
          {{ $i18n('The server did not accept the credentials.') }}
        </v-alert>
        <v-btn color="primary" @click="login" class="mt-2">{{ $i18n('Login') }} </v-btn>
      </v-card>
    </v-form>
  </v-app>
</template>

<style scoped>
  .login-form {
    margin: auto;
    margin-top: 30vh;
    width: 600px;
    padding: 20px;
  }
  .login-title {
    color: #2586d7;
    font-size: 2em;
    font-style: italic;
    font-weight: bold;
    font-family: Ubuntu, Verdana, Arial, Helvetica, sans-serif;
    margin-bottom: 20px;
  }
</style>

<script>
import LanguageMenu from '../components/LanguageMenu'
import api from '../services/api'

export default {

  components: {
    LanguageMenu
  },

  data() {
    return {
      username: '',
      password: '',
      authError: false,
      showPassword: false,
      requiredRule: [ (v) => Boolean(v) || this.$i18n('Required') ],
    }
  },

  methods: {
    async login() {
      if (!(await this.$refs.form.validate()).valid) {
        return
      }
      this.authError = false
      try {
        const response = await api.login({
          username: this.username,
          password: this.password
        })
        this.$router.push(response.data.password_empty ? '/password' : '/')
      } catch (err) {
        if (err.response && ([401, 404, 429].includes(err.response.status))) {
          this.authError = true
        } else {
          console.error(err)
        }
      }
    },
    keyControl(val) {
      if (val.key == 'Enter') {
        this.login()
      }
    }
  },

  mounted() {
    this.$refs.username.focus()
  }
}
</script>
