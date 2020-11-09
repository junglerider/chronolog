<template>
    <div class="report-container">
      <div class="report-title">{{ 'Working time' | i18n }}</div>
      <div>{{ 'From' | i18n }} {{ from | i18nDate }} {{ 'to' | i18n }} {{ to | i18nDate }}</div>
      <div class="report-subtitle" v-if="userId > 0">
        {{ 'Name' | i18n }}: {{ getUserName(userId) }}
      </div>
      <table class="report-body">
        <tr>
          <th>{{ "Day" | i18n }}</th>
          <th>{{ "Date" | i18n }}</th>
          <th v-if="userId <= 0">{{ "Name" | i18n }}</th>
          <th>{{ "Arrival" | i18n }}</th>
          <th>{{ "Departure" | i18n }}</th>
          <th class="report-right">{{ "Hours" | i18n }}</th>
        </tr>
        <tr v-for="rec of data" :key="rec.id">
          <td class="report-nowrap">{{ weekDay(rec.date) | i18n }}</td>
          <td class="report-nowrap">{{ rec.date | i18nDate }}</td>
          <td class="report-nowrap" v-if="userId <= 0">{{ getUserName(rec.user_id) }}</td>
          <td>{{ rec.arrival_time }}</td>
          <td>{{ rec.departure_time}}</td>
          <td class="report-right report-nowrap">
            {{ $i18nDecToHrs(rec.work_duration) }}
          </td>
        </tr>
        <tr>
          <th>{{ 'Total' | i18n }}</th>
          <th v-if="userId <= 0"></th>
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
      from: this.$route.query.start,
      to: this.$route.query.end,
      userId: this.$route.query.user,
      users: new Map(),
      data: [],
      total: 0,
    }
  },

  methods: {
    getUserName(id) {
      return this.users.has(Number(id)) ? this.users.get(Number(id)) : ''
    },
    weekDay(dateStr) {
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const date = new Date(dateStr)
      return weekdays[date.getDay()]
    }
  },

  async mounted() {
    if (api.user.id == this.userId || api.user.hasRole('reporting')) {
      try {
        const intervalFilter = `filter[date][gte]=${this.from}&filter[date][lte]=${this.to}`
        const userFilter = this.userId > 0 ? `&filter[user_id][eq]=${this.userId}` : ''
        const orderClause = `&order=date:ASC,user_id:ASC`
        const url = `/timeclock?${intervalFilter}${userFilter}${orderClause}`
        let response = await api.get(url)
        this.data = response.data
        response = await api.get('/user')
        this.users = new Map(response.data.map(u => [u.id, u.name]))
        this.total = this.data.reduce((acc, rec) => acc + rec.work_duration, 0)
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