<template>
  <div v-if="isBlankPage()">
    <!-- reload contents when language changes -->
    <router-view :key="$getLanguage() + user.id"/>
  </div>
  <v-app v-else id="chronolog">

    <v-app-bar
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

    <v-navigation-drawer
      v-model="drawer"
      color="#1958b7"
    >
      <v-list>

        <nav-link link="/" :tooltip="$i18n('Time clock, status and summary')">
          {{ $i18n('Dashboard') }}
        </nav-link>
        <nav-link link="/password" :tooltip="$i18n('Change your password')">
          {{ $i18n('Change Password') }}
        </nav-link>
        <nav-link>{{ $i18n('Time Sheets') }}</nav-link>
        <nav-link link="/time-sheet" :tooltip="$i18n('Enter working time and hours on a daily basis')">
          {{ $i18n('Edit Time Sheet') }}
        </nav-link>
        <nav-link link="/weekly-overview" :tooltip="$i18n('See working time entries for a week')">
          {{ $i18n('Weekly Overview') }}
        </nav-link>
        <nav-link link="/monthly-overview" :tooltip="$i18n('See working time entries for a whole month')">
          {{ $i18n('Monthly Overview') }}
        </nav-link>
        <nav-link link="/todo" :tooltip="$i18n('See/edit todo list, add tasks')">
          {{ $i18n('Todo List') }}
        </nav-link>
        <template v-if="user.hasRole('contacts')">
          <nav-link>{{ $i18n('Contacts') }}</nav-link>
          <nav-link link="/contacts" :tooltip="$i18n('Look up people and edit contact data')">
            {{ $i18n('Contacts') }}
          </nav-link>
          <nav-link link="/organisations" :tooltip="$i18n('Look up organisations and edit contact data')">
            {{ $i18n('Organisations') }}
          </nav-link>
        </template>
        <nav-link>{{ $i18n('Reporting') }}</nav-link>
        <nav-link link="/reporting" :tooltip="$i18n('Select report to view/print from a list of reports')">
          {{ $i18n('Reports') }}
        </nav-link>
        <nav-link v-if="user.hasRole('invoicing')" link="/invoices" :tooltip="$i18n('View, edit, create and print invoices')">
          {{ $i18n('Invoices') }}
        </nav-link>
        <nav-link v-if="user.hasRole('invoicing')" >{{ $i18n('Admin') }}</nav-link>
        <nav-link v-if="user.hasRole('invoicing')" link="/customers" :tooltip="$i18n('View/edit customers')">
          {{ $i18n('Customers') }}
        </nav-link>
        <nav-link v-if="user.hasRole('admin')" link="/users" :tooltip="$i18n('View/edit users and access privileges')">
          {{ $i18n('Users') }}
        </nav-link>
        <nav-link v-if="user.hasRole('admin')" link="/projects" :tooltip="$i18n('View project tree and maintain tasks')">
          {{ $i18n('Projects & Tasks') }}
        </nav-link>
        <nav-link v-if="false" link="/time-logs" :tooltip="$i18n('Amend time log entries of employees')">
          {{ $i18n('Correct Time Logs') }}
        </nav-link>
      </v-list>
    </v-navigation-drawer>

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
  html {
    overflow-y: auto !important;
  }
  .v-toolbar__content > .v-toolbar-title.app-title {
    flex: 0 0 auto;
    color: white;
    font-size: 1.3em;
    font-style: italic;
    font-weight: 700;
    font-family: Ubuntu, Verdana, Arial, Helvetica, sans-serif;
    padding-right: 0;
  }
  .v-toolbar__content > .v-toolbar-title.app-text {
    flex: 0 0 auto;
    color: white;
    font-size: 0.9em !important;
    margin-inline-start: 20px;
  }
  .v-main > .v-container {
    padding: 12px;
  }
  .v-input.v-text-field .v-field--variant-underlined .v-field__append-inner {
    align-items: center;
    padding-top: 0;
    padding-bottom: 0;
  }
  .v-btn--disabled.v-btn--variant-outlined {
    opacity: 1;
    border-color: #cfcfcf;
    color: #b5b5b5 !important;
  }
  .v-alert.v-alert--variant-tonal {
    border: 1px solid currentColor;
    padding: 12px 16px;
    border-radius: 4px;
  }
  .v-alert--variant-tonal .v-alert__prepend {
    margin-inline-end: 16px;
  }
  .page-title {
    font-size: 1.25em;
    font-weight: 500;
  }
  .form-col {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
  .v-table {
    font-size: 1rem !important;
  }
  .v-table > .v-table__wrapper > table > thead > tr > th {
    font-size: 1rem !important;
    font-weight: 700 !important;
    color: rgba(0, 0, 0, 0.6) !important;
  }
  .v-table > .v-table__wrapper > table > thead > tr > th,
  .v-table > .v-table__wrapper > table > tbody > tr > td {
    padding: 0 16px !important;
    height: 48px !important;
    font-size: 1rem !important;
  }
  .v-table > .v-table__wrapper > table > thead > tr > th:first-child,
  .v-table > .v-table__wrapper > table > tbody > tr > td:first-child {
    padding-left: 8px !important;
  }
  .v-table > .v-table__wrapper > table > thead > tr > th.v-data-table__th--sorted {
    color: rgba(0, 0, 0, 0.87) !important;
  }
  .v-card-text {
    font-size: 1em !important;
  }
  .v-data-table-footer {
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

  async mounted() {
    if (!this.user.id) {
      await api.reloadSession()
      this.user = api.user
    }
  },

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
