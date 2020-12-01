<template>
  <div v-if="loggedInUser.hasRole('admin')">
    <v-alert v-model="deletionError" text outlined dismissible type="error">
      {{ 'Some users have tasks or time sheets assigned. Users with tasks or time sheets cannot be deleted.' | i18n }}
    </v-alert>
    <data-list
      :title="'Users' | i18n"
      :headers="headers"
      apiBaseUrl="/user"
      uiBaseUrl="/users"
      :searchFilter="'&filter[login][like]={search}%'"
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
        loggedInUser: api.user,
        deletionError: false,
        headers: [
          { text: this.$i18n('ID'), value: 'id', align: 'start' },
          { text: this.$i18n('User name'), value: 'login' },
          { text: this.$i18n('Name'), value: 'name', sortable: false },
          { text: this.$i18n('Is Active'), value: 'is_active', sortable: false },
        ],
      }
    },

    methods: {
      afterGetData(data) {
        return data.map(record => {
          return {
            ...record,
            is_active: this.$i18n(record.is_active ? 'yes' : '')
          }
        })
      },
      async onDelete(selected) {
        const ids = selected.map(s => s.id).join(',')
        let response = await api.get(`/task/count?filter[user_id][in]=${ids}`)
        const taskCount = response.data.count
        response = await api.get(`/timelog/count?filter[user_id][in]=${ids}`)
        const timeLogCount = response.data.count
        if (taskCount > 0 || timeLogCount > 0) {
          this.deletionError = true
          throw ('Cannot delete users with tasks or timelogs assigned')
        }
        return selected.map(s => {
          return api.delete(`/user/${s.id}`)
        })
      }
    }
  }
</script>