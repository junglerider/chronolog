<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on" color="white" class=" ml-4 mr-2">
        <v-icon color="white">mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item class="squeeze">
        <v-list-item-content>
          <v-list-item-title>{{ user.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.username }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="changePassword()" class="squeeze">
        <v-list-item-icon>
          <v-icon>mdi-lock-question</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>{{ 'Change Password' | i18n }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="logout()" class="squeeze">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>{{ 'Logout' | i18n }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<style scoped>
  .squeeze {
    margin: -12px 0 -1px 0;
  }
</style>

<script>
import api from '../services/api'

export default {
  name: 'UserMenu',

  data() {
    return {
      user: api.user,
    }
  },
  methods: {
    changePassword() {
      this.$router.push('/password')
    },
    async logout() {
      try {
        await api.logout()
        window.location.href = '/login'
      } catch (err) {
        console.error(err)
      }
    }
  },
}

</script>
