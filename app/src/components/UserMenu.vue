<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props" color="white" class=" ml-4 mr-2" variant="text">
        <v-icon color="white">mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-title>{{ user.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ user.username }}</v-list-item-subtitle>
      </v-list-item>
      <v-list-item @click="changePassword()" prepend-icon="mdi-lock-question" :title="$i18n('Change Password')"></v-list-item>
      <v-list-item @click="logout()" prepend-icon="mdi-logout" :title="$i18n('Logout')"></v-list-item>
    </v-list>

  </v-menu>
</template>

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
