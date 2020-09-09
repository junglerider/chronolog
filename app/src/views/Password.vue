<template>
  <v-container>
    <v-form ref="form" class="password-form">
      <div class="page-title password-title">{{ 'Change Password' | i18n }}</div>
      <v-alert v-model="error" text outlined :type="errorType">
        {{ errorMessage }}
      </v-alert>
      <v-text-field
        v-model="oldPassword"
        :label="'Old password' | i18n"
        :type="showOldPassword ? 'text' : 'password'"
      >
        <v-btn
          @click="showOldPassword = !showOldPassword"
          tabindex="-1"
          icon small color="grey"
          slot="append"
        >
          <v-icon v-if="showOldPassword" >mdi-eye</v-icon>
          <v-icon v-if="!showOldPassword" >mdi-eye-off</v-icon>
        </v-btn>
      </v-text-field>
      <v-text-field
        v-model="newPassword1"
        :label="'New password' | i18n"
        :type="showNewPassword1 ? 'text' : 'password'"
        :rules="passwordRules"
        loading
      >
        <template v-slot:progress>
          <v-progress-linear
            :value="passwordStrength"
            :color="color"
            absolute
            height="5"
          ></v-progress-linear>
        </template>
        <v-btn
          @click="showNewPassword1 = !showNewPassword1"
          tabindex="-1"
          icon small color="grey"
          slot="append"
        >
          <v-icon v-if="showNewPassword1" >mdi-eye</v-icon>
          <v-icon v-if="!showNewPassword1" >mdi-eye-off</v-icon>
        </v-btn>
      </v-text-field>
      <v-text-field
        v-model="newPassword2"
        :label="'Retype new password' | i18n"
        :type="showNewPassword2 ? 'text' : 'password'"
        :rules="repeatRules"
      >
        <v-btn
          @click="showNewPassword2 = !showNewPassword2"
          tabindex="-1"
          icon small color="grey"
          slot="append"
        >
          <v-icon v-if="showNewPassword2" >mdi-eye</v-icon>
          <v-icon v-if="!showNewPassword2" >mdi-eye-off</v-icon>
        </v-btn>
      </v-text-field>
      <v-btn color="primary" @click="updatePassword" class="mt-2">{{ 'Update' | i18n }} </v-btn>
    </v-form>
  </v-container>
</template>

<style scoped>
  .password-form {
    width: 600px;
    padding: 10px;
  }
  .password-title {
    margin-top: -4px;
    margin-bottom: 20px;
  }
</style>

<script>
import api from '../services/api'

export default {
  data() {
    return {
      user: api.user,
      username: api.user.login,
      oldPassword: '',
      newPassword1: '',
      newPassword2: '',
      showOldPassword: false,
      showNewPassword1: false,
      showNewPassword2: false,
      error: false,
      errorMessage: '',
      errorType: 'success',
      requiredRule: [ v => Boolean(v) || this.$i18n('Required') ],
      passwordRules: [
        v => Boolean(v) || this.$i18n('Required'),
        v => v !== this.oldPassword || this.$i18n('Password is identical to previous one'),
        () => this.passwordStrength >= 80 || this.$i18n('Insufficient password strength'),
      ],
      repeatRules: [
        v => Boolean(v) || this.$i18n('Required'),
        v => v === this.newPassword1 || this.$i18n('The retyped password is not the same'),
      ]
    }
  },
  methods: {
    async updatePassword() {
      this.updateError = false
      if (!this.$refs.form.validate()) {
        return
      }
      try {
        await api.put(`/user/${api.user.id}/password`, {
          password: this.newPassword1,
          oldPassword: this.oldPassword,
        })
        this.errorMessage = this.$i18n('Your password has been updated.')
        this.errorType = 'success'
        this.error = true
      } catch (e) {
        this.errorMessage = this.$i18n('The server could not update the password.')
        this.errorType = 'error'
        this.error = true
        console.log(e)
      }
    },
    // https://github.com/elboletaire/password-strength-meter
    calculateStrength() {
      const password = this.newPassword1
      let score = 0

      if (password.toLowerCase() === this.oldPassword.toLowerCase()) {
        return 0
      }

      // password length
      score += password.length * 4
      score += this.checkRepetition(1, password).length - password.length
      score += this.checkRepetition(2, password).length - password.length
      score += this.checkRepetition(3, password).length - password.length
      score += this.checkRepetition(4, password).length - password.length

      // password has 3 numbers
      if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        score += 5
      }

      // password has at least 2 symbols
      var symbols = '.*[!,@,#,$,%,^,&,*,?,_,~]'
      symbols = new RegExp('(' + symbols + symbols + ')')
      if (password.match(symbols)) {
        score += 5
      }

      // password has Upper and Lower chars
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        score += 10
      }

      // password has number and chars
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        score += 15
      }

      // password has number and symbol
      if (password.match(/([!@#$%^&*?_~])/) && password.match(/([0-9])/)) {
        score += 15
      }

      // password has char and symbol
      if (password.match(/([!@#$%^&*?_~])/) && password.match(/([a-zA-Z])/)) {
        score += 15
      }

      // password is just numbers or chars
      if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
        score -= 10
      }

      if (score > 100) {
        score = 100
      }

      if (score < 0) {
        score = 0
      }

      return score
    },
    checkRepetition(length, str) {
      let res = '', repeated = false
      for (var i = 0; i < str.length; i++) {
        repeated = true
        for (var j = 0; j < length && (j + i + length) < str.length; j++) {
          repeated = repeated && (str.charAt(j + i) === str.charAt(j + i + length))
        }
        if (j < length) {
          repeated = false
        }
        if (repeated) {
          i += length - 1
          repeated = false
        }
        else {
          res += str.charAt(i)
        }
      }
      return res
    }
  },
  computed: {
    passwordStrength () {
      return this.calculateStrength()
    },
    color () {
      return ['error', 'warning', 'success'][Math.floor(this.passwordStrength / 40)]
    },
  },
}
</script>
