<template>
  <div>
    <v-toolbar flat color="white">
      <div class="page-title">{{ title }}</div>
      <v-spacer></v-spacer>
      <v-text-field
        v-if="searchFilter"
        class="mr-10"
        style="max-width: 300px"
        v-model="search"
        clearable
        append-icon="mdi-magnify"
        :label="'Search' | i18n"
        single-line
        hide-details
      ></v-text-field>
      <v-btn color="primary" @click="$router.push(`${uiBaseUrl}/new`)">
        <v-icon left>mdi-plus-circle-outline</v-icon>
        {{ 'Add' | i18n }}
      </v-btn>

      <v-dialog v-model="deleteDialog" max-width="500">
        <template v-slot:activator="{ on, attrs }">
        <v-btn
          outlined
          :disabled="!selected || !selected.length"
          color="primary"
          class="ml-2"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon left>mdi-delete</v-icon>
          {{ 'Delete' | i18n }}
        </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline" primary-title>
            {{ 'Delete' | i18n }}
          </v-card-title>
          <v-card-text>
            <span v-if="selected.length > 1">{{ 'Are you sure you want to delete {1} records?' | i18n(selected.length) }}</span>
            <span v-else>{{ 'Are you sure you want to delete this record?' | i18n }}</span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="onDelete">
              {{ "OK" || i18n }}
            </v-btn>
            <v-btn text @click="deleteDialog = false">
              {{ "Cancel" || i18n }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="data"
      item-key="id"
      sort-by="id"
      :sort-desc="true"
      :items-per-page=15
      :page="page"
      @page-count="pageCount = $event"
      @click:row="rowClick"
      :options.sync="options"
      :server-items-length="count"
      :search="search"
      :loading="loading"
      show-select
      v-model="selected"
      hide-default-footer
      class="elevation-0"
    >
      <template v-slot:no-data>
        {{ 'No data to display' | i18n }}
      </template>
    </v-data-table>
    <div style="margin-top: 20px">
      <v-pagination v-model="page" :length="pageCount" total-visible="10"></v-pagination>
    </div>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
      {{ messageText }}
    </v-snackbar>
  </div>
</template>

<style>
  .v-data-table tbody td {
    cursor: pointer !important;
  }

  .v-data-table tbody tr:hover {
    background-color: #d2e2fa !important;
  }
</style>

<script>
import api from '../api'

export default {
  name: 'DataList',

  props: {
    title: String,
    headers: Array,
    apiBaseUrl: String,
    uiBaseUrl: String,
    searchFilter: String,
    onGetData: Function,
    onDeleteData: Function,
  },

  data() {
    return {
      data: [],
      count: 0,
      page: 1,
      pageCount: 0,
      loading: false,
      options: {},
      search: '',
      selected: [],
      deleteDialog: false,
      message: false,
      messageColor: 'success',
      messageText: '',
    }
  },

  watch: {

    async search() {
      this.options.page = 1
      this.data = await this.getData()
    },

    options: {
      deep: true,
      async handler() {
        this.data = await this.getData()
      }
    },

  },

  methods: {

    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },

    buildFilter() {
      if (this.searchFilter && this.search && this.search.length) {
        return this.searchFilter.replace(/{search}/g, encodeURIComponent(this.search))
      }
      return ''
    },

    async getData() {
      this.loading = true
      let data = []
      try {
        const filter = this.buildFilter()
        this.count = await api.getCount(this.apiBaseUrl, filter)
        if (this.onGetData) {
          data = await this.onGetData(this.options, filter)
        } else {
          data = await api.getList(this.apiBaseUrl, this.options, filter)
        }
      } catch(e) {
        console.error(e)
      }
      this.loading = false
      return data
    },

    async onDelete() {
      this.deleteDialog = false
      try {
        const deletionPromises = this.onDeleteData ?
          this.onDeleteData(this.selected) :
          this.selected.map(model => {
            return api.delete(`${this.apiBaseUrl}/${model.id}`)
          })
        await Promise.all(deletionPromises)
        this.selected = []
        this.showMessage('OK - Deleted!')
        this.data = await this.getData()
      } catch(e) {
        console.error(e)
        this.showMessage('Deletion did not succeed.', 'error')
      }
    },

    rowClick(row) {
      if (row && row.id) {
        this.$router.push(`/${this.uiBaseUrl}/${row.id}`)
      }
    }

  },
}
</script>