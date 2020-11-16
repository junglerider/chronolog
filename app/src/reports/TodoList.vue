<template>
    <div class="report-container">
      <div class="report-title">{{ 'Todo List' | i18n }}</div>
      <div class="report-subtitle" v-if="userId > 0">
        {{ 'Name' | i18n }}: {{ getUserName(userId) }}
      </div>
      <table class="report-body">
        <tr>
          <th>{{ "Task" | i18n }}</th>
          <th v-if="userId <= 0">{{ "Name" | i18n }}</th>
          <th>{{ "Project" | i18n }}</th>
          <th>{{ "Customer" | i18n }}</th>
          <th>{{ "Status" | i18n }}</th>
          <th>{{ "Created at" | i18n }}</th>
          <th class="report-right">{{ "Total hours" | i18n }}</th>
        </tr>
        <tr v-for="rec of data" :key="rec.id">
          <td class="report-nowrap">{{ rec.name }}</td>
          <td class="report-nowrap" v-if="userId <= 0">{{ getUserName(rec.user_id) }}</td>
          <td>{{ rec.parent_name }}</td>
          <td>{{ rec.customer_name }}</td>
          <td>{{ rec.is_active === 1 ? 'active' : 'inactive' | i18n }}</td>
          <td>{{ rec.created_at | i18nDate }}</td>
          <td class="report-right report-nowrap">
            {{ $i18nDecToHrs(rec.duration) }}
          </td>
        </tr>
        <tr>
          <th>{{ 'Total' | i18n }}</th>
          <th v-if="userId <= 0"></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th class="report-right">{{ $i18nDecToHrs(total) }}</th>
        </tr>
      </table>
    </div>
</template>

<script>
import api from '../services/api'

export default {

  data() {
    return {
      userId: this.$route.query.user,
      customerId: this.$route.query.customer,
      users: new Map(),
      data: [],
      total: 0,
    }
  },

  methods: {
    getUserName(id) {
      return this.users.has(Number(id)) ? this.users.get(Number(id)) : ''
    },
  },

  async mounted() {
    if (api.user.id == this.userId || api.user.hasRole('reporting')) {
      try {
        const taskFilter = `format=extended&filter[is_leaf][eq]=1&filter[is_closed][eq]=0`
        const userFilter = this.userId > 0 ? `&filter[user_id][eq]=${this.userId}` : ''
        const customerFilter = this.customerId > 0 ? `&filter[customer_id][eq]=${this.customerId}` : ''
        const orderClause = `&order=customer_id:ASC,parent_id:ASC,created_at:ASC`
        const url = `/task?${taskFilter}${userFilter}${customerFilter}${orderClause}`
        let response = await api.get(url)
        this.data = response.data
        response = await api.get('/user')
        this.users = new Map(response.data.map(u => [u.id, u.name]))
        this.total = this.data.reduce((acc, rec) => acc + rec.duration, 0)
      } catch(e) {
        console.error(e)
      }
    }
  }
}
</script>

<style scoped>
  @import '../assets/reports.css';
</style>