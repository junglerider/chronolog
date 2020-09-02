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

    <v-card :elevation="6" class="login-form">
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
        :rules="requiredRule"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append="showPassword = !showPassword"
      ></v-text-field>
      <v-btn color="primary">{{ 'Login' | i18n }} </v-btn>
    </v-card>
  </v-app>
</template>

<style scoped>
  .login-form {
    margin: auto;
    margin-top: 20%;
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

export default {
  components: {
    LanguageMenu
  },
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      requiredRule: [ (v) => Boolean(v) || this.$i18n('Required') ],
    }
  },
  mounted() {
    this.$refs.username.focus()
  }
}
</script>
