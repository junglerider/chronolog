<template>
    <div class="report-container">
      <div class="report-title">{{ $i18n('Working time') }}</div>
      <div>{{ $i18n('From') }} {{ $i18nDate(from) }} {{ $i18n('to') }} {{ $i18nDate(to) }}</div>
      <div class="report-subtitle" v-if="userId > 0">
        {{ $i18n('Name') }}: {{ getUserName(userId) }}
      </div>
      <table class="report-body">
        <tr>
          <th>{{ $i18n("Day") }}</th>
          <th>{{ $i18n("Date") }}</th>
          <th v-if="userId <= 0">{{ $i18n("Name") }}</th>
          <th>{{ $i18n("Arrival") }}</th>
          <th>{{ $i18n("Departure") }}</th>
          <th class="report-right">{{ $i18n("Hours") }}</th>
        </tr>
        <tr v-for="rec of data" :key="rec.id">
          <td class="report-nowrap">{{ $i18n(weekDay(rec.date)) }}</td>
          <td class="report-nowrap">{{ $i18nDate(rec.date) }}</td>
          <td class="report-nowrap" v-if="userId <= 0">{{ getUserName(rec.user_id) }}</td>
          <td>{{ rec.arrival_time }}</td>
          <td>{{ rec.departure_time}}</td>
          <td class="report-right report-nowrap">
            {{ $i18nDecToHrs(rec.work_duration) }}
          </td>
        </tr>
        <tr>
          <th>{{ $i18n('Total') }}</th>
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