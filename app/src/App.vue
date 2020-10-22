<template>
  <div v-if="isBlankPage()">
    <!-- reload contents when language changes -->
    <router-view :key="$getLanguage() + user.id"/>
  </div>
  <v-app v-else id="chronolog">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      color="#1958b7"
    >
      <v-list>

        <nav-link link="/" :tooltip="'Time clock, status and summary' | i18n ">
          {{ 'Dashboard' | i18n }}
        </nav-link>
        <nav-link link="/password" :tooltip="'Change your password' | i18n ">
          {{ 'Change Password' | i18n }}
        </nav-link>
        <nav-link>{{ 'Time Sheets' | i18n }}</nav-link>
        <nav-link link="/time-sheet" :tooltip="'Enter working time and hours on a daily basis' | i18n ">
          {{ 'Edit Time Sheet' | i18n }}
        </nav-link>
        <nav-link link="/weekly-overview" :tooltip="'See working time entries for a week' | i18n">
          {{ 'Weekly Overview' | i18n }}
        </nav-link>
        <nav-link link="/monthly-overview" :tooltip="'See working time entries for a whole month' | i18n">
          {{ 'Monthly Overview' | i18n }}
        </nav-link>
        <nav-link link="/todo" :tooltip="'See/edit todo list, add tasks' | i18n">
          {{ 'Todo List' | i18n }}
        </nav-link>
        <template v-if="user.hasRole('contacts')">
          <nav-link>{{ 'Contacts' | i18n }}</nav-link>
          <nav-link link="/contacts" :tooltip="'Look up people and edit contact data' | i18n ">
            {{ 'Contacts' | i18n }}
          </nav-link>
          <nav-link link="/organisations" :tooltip="'Look up organisations and edit contact data' | i18n ">
            {{ 'Organisations' | i18n }}
          </nav-link>
        </template>
        <nav-link>{{ 'Reporting' | i18n }}</nav-link>
        <nav-link link="/reporting" :tooltip="'Select report to view/print from a list of reports' | i18n ">
          {{ 'Reports' | i18n }}
        </nav-link>
        <nav-link v-if="user.hasRole('invoicing')" link="/invoices" :tooltip="'View, edit, create and print invoices' | i18n ">
          {{ 'Invoices' | i18n }}
        </nav-link>
        <nav-link v-if="user.hasRole('invoicing')" >{{ 'Admin' | i18n }}</nav-link>
        <nav-link v-if="user.hasRole('invoicing')" link="/customers" :tooltip="'View/edit customers' | i18n ">
          {{ 'Customers' | i18n }}
        </nav-link>
        <nav-link v-if="user.hasRole('admin')" link="/users" :tooltip="'View/edit users and access privileges' | i18n ">
          {{ 'Users' | i18n }}
        </nav-link>
        <nav-link v-if="user.hasRole('admin')" link="/projects" :tooltip="'View project tree and maintain tasks' | i18n ">
          {{ 'Projects & Tasks' | i18n }}
        </nav-link>
        <nav-link v-if="false" link="/time-logs" :tooltip="'Amend time log entries of employees' | i18n ">
          {{ 'Correct Time Logs' | i18n }}
        </nav-link>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
      color="black"
      style="color: white"
    >
      <v-app-bar-nav-icon color="white" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="app-title">chronolog</v-toolbar-title>
      <v-toolbar-title class="app-text">Time &amp; Project Management</v-toolbar-title>
      <v-spacer></v-spacer>

      <simple-clock />

      <user-menu :key="$getLanguage() + user.id"/>

      <language-menu @changeLanguage="$forceUpdate()" />

    </v-app-bar>

    <v-main>
      <v-container fluid>
        <!-- reload contents when language changes -->
        <router-view :key="$getLanguage() + user.id"/>
      </v-container>
    </v-main>

  </v-app>
</template>

<style>
    /* global style definitions and overrides */
  .app-title {
    color: white;
    font-size: 1.3em;
    font-style: italic;
    font-weight: bold;
    font-family: Ubuntu, Verdana, Arial, Helvetica, sans-serif;
    padding-right: 20px;
  }
  .app-text {
    color: white;
    font-size: 0.9em !important;
  }
  .page-title {
    font-size: 1.25em;
    font-weight: 500;
  }
  .form-col {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
  .v-data-table thead th {
    font-size: 1em !important;
  }
  .v-data-table tbody td {
    font-size: 1em !important;
  }
  .v-card__text {
    font-size: 1em !important;
  }
  .v-data-footer {
    font-size: 1em !important;
  }
  .v-date-picker-title__date {
    font-size: 1.2em !important;
  }
</style>

<script>
import SimpleClock from './components/SimpleClock'
import NavLink from './components/NavLink'
import LanguageMenu from './components/LanguageMenu'
import UserMenu from './components/UserMenu'
import api from './services/api'

export default {
  name: 'App',
  components: {
    SimpleClock,
    NavLink,
    LanguageMenu,
    UserMenu
  },
  data() {
    return {
      drawer: null,
      user: api.user,
  }},
  methods: {
    hasRole(role) {
      return api.hasRole(role)
    },

    isBlankPage() {
      return this.$route.path.startsWith('/reports') || this.$route.path.startsWith('/login')
    }
  },
  async beforeUpdate() {
    if (!this.user.id) {
      await api.reloadSession()
      this.user = api.user
    }
  }
}

</script>
