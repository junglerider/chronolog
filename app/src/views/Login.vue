<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
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
          :label="'User name' | i18n"
          :rules="requiredRule"
          ref="username"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :label="'Password' | i18n"
          :type="showPassword ? 'text' : 'password'"
        >
        <v-btn
          @click="showPassword = !showPassword"
          tabindex="-1"
          icon small color="grey"
          slot="append"
        >
          <v-icon v-if="showPassword" >mdi-eye</v-icon>
          <v-icon v-if="!showPassword" >mdi-eye-off</v-icon>
        </v-btn>
        </v-text-field>
        <v-alert v-model="authError" text outlined type="error">
          {{ 'The server did not accept the credentials.' | i18n }}
        </v-alert>
        <v-btn color="primary" @click="login" class="mt-2">{{ 'Login' | i18n }} </v-btn>
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
      if (!this.$refs.form.validate()) {
        return
      }
      this.authError = false
      try {
        await api.login({
          username: this.username,
          password: this.password
        })
        this.$router.push('/')
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
