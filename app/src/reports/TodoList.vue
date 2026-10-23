<template>
    <div class="report-container">
      <div class="report-title">{{ $i18n('Todo List') }}</div>
      <div class="report-subtitle" v-if="userId > 0">
        {{ $i18n('Name') }}: {{ getUserName(userId) }}
      </div>
      <table class="report-body">
        <tr>
          <th>{{ $i18n("Task") }}</th>
          <th v-if="userId <= 0">{{ $i18n("Name") }}</th>
          <th>{{ $i18n("Project") }}</th>
          <th>{{ $i18n("Customer") }}</th>
          <th>{{ $i18n("Status") }}</th>
          <th>{{ $i18n("Created at") }}</th>
          <th class="report-right">{{ $i18n("Total hours") }}</th>
        </tr>
        <tr v-for="rec of data" :key="rec.id">
          <td class="report-nowrap">{{ rec.name }}</td>
          <td class="report-nowrap" v-if="userId <= 0">{{ getUserName(rec.user_id) }}</td>
          <td>{{ rec.parent_name }}</td>
          <td>{{ rec.customer_name }}</td>
          <td>{{ $i18n(rec.is_active === 1 ? 'active' : 'inactive') }}</td>
          <td>{{ $i18nDate(rec.created_at) }}</td>
          <td class="report-right report-nowrap">
            {{ $i18nDecToHrs(rec.duration) }}
          </td>
        </tr>
        <tr>
          <th>{{ $i18n('Total') }}</th>
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