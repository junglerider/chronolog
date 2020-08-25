<template>
  <div>
    <v-alert v-model="deletionError" text outlined dismissible type="error">
      {{ 'Some customers have tasks assigned. Customers with tasks cannot be deleted.' | i18n }}
    </v-alert>
    <data-list
      :title="'Customers' | i18n"
      :headers="headers"
      apiBaseUrl="/customer"
      uiBaseUrl="/customers"
      :searchFilter="'&filter[name][like]={search}%'"
      :afterGetData="afterGetData"
      :onDeleteData="onDelete"
    ></data-list>
  </div>
</template>

<script>
  import DataList from '../components/DataList'
  import api from '../services/api'

  export default {
    components: {
      DataList
    },
    data() {
      return {
        deletionError: false,
        headers: [
          { text: this.$i18n('ID'), value: 'id', align: 'start' },
          { text: this.$i18n('Name'), value: 'name' },
          { text: this.$i18n('Organisation'), value: 'organisation_name', sortable: false },
          { text: this.$i18n('Is Retired'), value: 'is_retired', sortable: false },
        ],
      }
    },

    methods: {
      afterGetData(data) {
        return data.map(record => {
          return {
            ...record,
            is_retired: this.$i18n(record.is_retired ? 'yes' : '')
          }
        })
      },

      async onDelete(selected) {
        const ids = selected.map(s => s.id).join(',')
        const response = await api.get(`/customer/task-count?filter[id][in]=${ids}`)
        const taskCount = response.data.reduce((count, customer) => count + customer.task_count, 0)
        if (taskCount > 0) {
          this.deletionError = true
          throw ('Cannot delete customers with tasks assigned')
        }
        return selected.map(s => {
          return api.delete(`/customer/${s.id}`)
        })
      }
    }
  }
</script>