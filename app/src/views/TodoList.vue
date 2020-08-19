<template>
  <div>
    <v-alert v-model="deletionError" text outlined dismissible type="error">
      {{ 'Some tasks have hours booked. Tasks with hours booked cannot be deleted.' | i18n }}
    </v-alert>
    <data-list
      :title="'Todo List' | i18n"
      :headers="headers"
      :apiBaseUrl="`todo/${userId}`"
      uiBaseUrl="todo"
      :onGetData="getData"
      :onDeleteData="onDelete"
    ></data-list>
  </div>
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
        deletionError: false,
        headers: [
          { text: this.$i18n('ID'), value: 'id', align: 'start' },
          { text: this.$i18n('Name'), value: 'name', sortable: true },
          { text: this.$i18n('Assigned to me'), value: 'assigned', sortable: false },
          { text: this.$i18n('Customer'), value: 'customer_name', sortable: false },
          { text: this.$i18n('Active'), value: 'is_active', sortable: false },
          { text: this.$i18n('Created'), value: 'created_at', sortable: true },
          { text: this.$i18n('Total hours'), value: 'hours', align: 'end', sortable: false },
        ],
      }
    },

    methods: {

      async getData(options) {
        const sortDirection = options.sortDesc[0] ? 'desc' : 'asc'
        const sortClause = options.sortBy[0] ? `?order=${options.sortBy[0]}:${sortDirection}` : ''
        const response = await api.get(`/todo/${this.userId}${sortClause}`)
        return response.data.map(record => {
          return {
            ...record,
            assigned: this.$i18n(record.user_id  ?  'yes' : ''),
            created_at: this.$i18nDate(record.created_at).substr(0, 10),
            hours: this.$i18nDecToHrs(record.duration),
            is_active: this.$i18n(record.is_active ? 'yes' : '')
          }
        })
      },

      onDelete(selected) {
        for (let task of selected) {
          if (task.duration) {
            this.deletionError = true
            throw ('Cannot delete tasks with hours booked')
          }
        }
        return selected.map(task => {
          return api.delete(`/task/${task.id}`)
        })
      }
    }
  }
</script>