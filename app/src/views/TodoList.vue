<template>
  <data-list
    :title="'Todo List' | i18n"
    :headers="headers"
    :apiBaseUrl="`todo/${userId}`"
    uiBaseUrl="todo"
    :onGetData="getData"
  ></data-list>
</template>

<script>
  import DataList from '../components/DataList'
  import api from '../api'

  export default {
    components: {
      DataList
    },
    data() {
      return {
        userId: 1,
        headers: [
          { text: this.$i18n('ID'), value: 'id', align: 'start' },
          { text: this.$i18n('Name'), value: 'name', sortable: true },
          { text: this.$i18n('Customer'), value: 'customer_name', sortable: false },
          { text: this.$i18n('Description'), value: 'description', sortable: false },
          { text: this.$i18n('Created'), value: 'created_at', sortable: true },
          { text: this.$i18n('Total hours'), value: 'hours', align: 'end', sortable: false },
        ],
      }
    },

    methods: {
      async getData(options) {
        console.log('Options:', options)
        const sortDirection = options.sortDesc[0] ? 'desc' : 'asc'
        const sortClause = options.sortBy[0] ? `?order=${options.sortBy[0]}:${sortDirection}` : ''
        const response = await api.get(`todo/${this.userId}${sortClause}`)
        console.log('Data:', response)
        return response.data.map(record => {
          return {
            ...record,
            description: record.description && record.description.length > 15 ?
              record.description.length.substr(0, 15) + '...' :
              record.description,
            created_at: this.$i18nDate(record.created_at),
            hours: this.$i18nDecToHrs(record.duration)
          }
        })
      }
    }
  }
</script>