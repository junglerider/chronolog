<template>
  <div>
    <v-toolbar flat color="background" class="data-list-toolbar">
      <settings v-if="settings && user.hasRole('admin')" :keys="settings" style="margin-left: -12px"></settings>
      <div class="page-title">{{ title }}</div>
      <v-spacer></v-spacer>
      <v-pagination
        v-model="page"
        :length="pageCount"
        :total-visible="7"
        density="comfortable"
        class="data-list-pagination"
        style="margin-right: 26px"
      ></v-pagination>
      <v-text-field
        v-if="searchFilter"
        class="mr-10"
        style="max-width: 300px"
        v-model="search"
        clearable
        append-inner-icon="mdi-magnify"
        density="compact"
        :label="$i18n('Search')"
        single-line
        hide-details
      ></v-text-field>
      <v-btn color="primary" variant="flat" @click="$router.push(`${uiBaseUrl}/new`)">
        <v-icon start>mdi-plus-circle-outline</v-icon>
        {{ $i18n('Add') }}
      </v-btn>

      <v-dialog v-model="deleteDialog" max-width="500">
        <template v-slot:activator="{ props }">
        <v-btn
          :disabled="!selected || !selected.length"
          color="primary"
          class="ml-2"
          v-bind="props"
         variant="outlined">
          <v-icon start>mdi-delete</v-icon>
          {{ $i18n('Delete') }}
        </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline">
            {{ $i18n('Delete') }}
          </v-card-title>
          <v-card-text>
            <span v-if="selected.length > 1">{{ $i18n('Are you sure you want to delete {1} records?', selected.length) }}</span>
            <span v-else>{{ $i18n('Are you sure you want to delete this record?') }}</span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="onDelete" variant="text">
              {{ $i18n("OK") }}
            </v-btn>
            <v-btn @click="deleteDialog = false" variant="text">
              {{ $i18n("Cancel") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <slot name="buttons" :selected="selected"></slot>

    </v-toolbar>
    <v-data-table-server
      v-model="selected"
      :headers="tableHeaders"
      :items="data"
      item-value="id"
      return-object
      show-select
      :items-length="count"
      :items-per-page="itemsPerPage"
      :page="page"
      :sort-by="sortBy"
      :loading="loading"
      hide-default-footer
      class="elevation-0"
      @update:options="onOptions"
      @click:row="rowClick"
    >
      <template v-slot:no-data>
        {{ $i18n('No data to display') }}
      </template>
    </v-data-table-server>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" location="top" variant="tonal">
      {{ messageText }}
    </v-snackbar>
  </div>
</template>

<style>
  .data-list-toolbar .v-toolbar__content {
    padding-inline: 16px;
  }
  .data-list-pagination {
    flex: 0 1 auto;
    width: auto;
  }
  .data-list-toolbar .v-field--appended {
    padding-inline-end: 4px;
  }
  .v-data-table tbody td {
    cursor: pointer !important;
  }

  .v-data-table tbody tr:hover {
    background-color: rgba(var(--v-theme-primary), 0.15) !important;
  }
</style>

<script>
import api from '../services/api'
import Settings from '../components/Settings'
import { controlArrowDirection } from '../services/keyboard'

export default {
  name: 'DataList',

  components: {
    Settings
  },

  props: {
    title: String,
    headers: Array,
    apiBaseUrl: String,
    uiBaseUrl: String,
    searchFilter: String,
    onGetData: Function,
    afterGetData: Function,
    onDeleteData: Function,
    settings: String,
  },

  data() {
    return {
      user: api.user,
      data: [],
      count: 0,
      page: 1,
      itemsPerPage: 15,
      sortBy: [{ key: 'id', order: 'desc' }],
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

  computed: {
    tableHeaders() {
      return this.headers.map(header => ({
        title: header.text,
        key: header.value,
        align: header.align,
        width: header.width,
        sortable: header.sortable !== false
      }))
    },
    pageCount() {
      return Math.ceil(this.count / this.itemsPerPage)
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeydown)
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown)
  },

  watch: {
    async search() {
      if (this.page !== 1) {
        this.page = 1
        return
      }
      this.data = await this.getData()
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
          if (this.afterGetData) {
            data = this.afterGetData(data)
          }
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
          await this.onDeleteData(this.selected) :
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
    async onOptions(options) {
      this.options = {
        page: options.page,
        itemsPerPage: options.itemsPerPage,
        sortBy: options.sortBy.map(sort => sort.key),
        sortDesc: options.sortBy.map(sort => sort.order === 'desc')
      }
      this.sortBy = options.sortBy
      this.data = await this.getData()
    },
    onKeydown(event) {
      const direction = controlArrowDirection(event)
      if (direction < 0 && this.page > 1) {
        event.preventDefault()
        this.page -= 1
      } else if (direction > 0 && this.page < this.pageCount) {
        event.preventDefault()
        this.page += 1
      }
    },
    rowClick(event, { item }) {
      if (event.target.closest('.v-selection-control')) {
        return
      }
      if (item && item.id) {
        this.$router.push(`${this.uiBaseUrl}/${item.id}`)
      }
    }

  },
}
</script>