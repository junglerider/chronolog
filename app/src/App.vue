<template>
  <div v-if="isBlankPage()">
    <!-- reload contents when language changes -->
    <router-view :key="$getLanguage()"/>
  </div>
  <v-app v-else id="chronolog">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      color="#1958b7"
    >
      <v-list>

        <nav-link link="/" :tooltip="'Monthly summary and statistics' | i18n ">
          {{ 'Dashboard' | i18n }}
        </nav-link>
        <nav-link link="/password" :tooltip="'Change your password' | i18n ">
          {{ 'Change Password' | i18n }}
        </nav-link>
        <nav-link link="/logout" :tooltip="'Forget password and display login form' | i18n ">
          {{ 'Logout' | i18n }}
        </nav-link>
        <nav-link>{{ 'Time Sheets' | i18n }}</nav-link>
        <nav-link link="/time-sheet" :tooltip="'Enter working time and hours on a daily basis' | i18n ">
          {{ 'Edit Time Sheet' | i18n }}
        </nav-link>
        <nav-link link="/calendar" :tooltip="'See working time entries for a whole month' | i18n">
          {{ 'Monthly Overview' | i18n }}
        </nav-link>
        <nav-link link="/todo" :tooltip="'See/edit todo list, add tasks' | i18n">
          {{ 'Todo List' | i18n }}
        </nav-link>
        <nav-link>{{ 'Contacts' | i18n }}</nav-link>
        <nav-link link="/contacts" :tooltip="'Look up people and edit contact data' | i18n ">
          {{ 'Contacts' | i18n }}
        </nav-link>
        <nav-link link="/organisations" :tooltip="'Look up organisations and edit contact data' | i18n ">
          {{ 'Organisations' | i18n }}
        </nav-link>
        <nav-link>{{ 'Reporting' | i18n }}</nav-link>
        <nav-link link="/reporting" :tooltip="'Select report to view/print from a list of reports' | i18n ">
          {{ 'Reports' | i18n }}
        </nav-link>
        <nav-link>{{ 'Admin' | i18n }}</nav-link>
        <nav-link link="/customers" :tooltip="'View/edit customer details' | i18n ">
          {{ 'Customers' | i18n }}
        </nav-link>
        <nav-link link="/users" :tooltip="'View/edit user details and access privileges' | i18n ">
          {{ 'Users' | i18n }}
        </nav-link>
        <nav-link link="/tasks" :tooltip="'View project tree and maintain tasks' | i18n ">
          {{ 'Projects & Tasks' | i18n }}
        </nav-link>
        <nav-link link="/time-logs" :tooltip="'Amend time log entries of employees' | i18n ">
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

      <v-btn icon color="white" class=" ml-4 mr-2">
        <v-icon color="white">mdi-account-circle</v-icon>
      </v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" color="white" class="mr-4">
            <img style="width: 30px" :src="`/images/flags/${selectedLanguage}.svg`"/>
          </v-btn>
        </template>

        <v-list>
          <lang-menu-item locale="en" :name="'English' | i18n" @clicked="selectLanguage"/>
          <lang-menu-item locale="de" :name="'German' | i18n" @clicked="selectLanguage"/>
          <lang-menu-item locale="fr" :name="'French' | i18n" @clicked="selectLanguage"/>
          <lang-menu-item locale="es" :name="'Spanish' | i18n" @clicked="selectLanguage"/>
          <lang-menu-item locale="it" :name="'Italian' | i18n" @clicked="selectLanguage"/>
        </v-list>

      </v-menu>

    </v-app-bar>

    <v-main>
      <v-container fluid>
        <!-- reload contents when language changes -->
        <router-view :key="$getLanguage()"/>
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
import SimpleClock from './components/SimpleClock.vue'
import NavLink from './components/NavLink.vue'
import LangMenuItem from './components/LangMenuItem.vue'

export default {
  name: 'App',
  components: {
    SimpleClock,
    NavLink,
    LangMenuItem
  },
  data() {
    return {
      drawer: null,
      selectedLanguage: this.$getLanguage(),
      selectLanguage: async language => {
        this.selectedLanguage = language
        await this.$setLanguage(language)
        this.$forceUpdate()
      }
  }},
  methods: {
    isBlankPage() {
      return this.$route.path.startsWith('/reports')
    }
  }
}

</script>
