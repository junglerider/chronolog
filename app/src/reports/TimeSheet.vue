<template>
  <div class="report-container">
    <div class="report-title">{{ $i18n("Chronological time sheet") }}</div>
    <div>
      {{ $i18n("From") }} {{ $i18nDate(from) }} {{ $i18n("to") }} {{ $i18nDate(to) }}
    </div>
    <div class="report-subtitle">
      <span v-if="userId > 0 && data.length">{{ $i18n("Name") }}: {{ data[0].user_name }}</span>
      <span v-if="customerId > 0 && data.length">{{ $i18n("Customer") }}: {{ data[0].customer_name }}</span>
    </div>
    <table class="report-body">
      <tr>
        <th>{{ $i18n("Date") }}</th>
        <th v-if="userId <= 0">{{ $i18n("Name") }}</th>
        <th v-if="customerId <= 0">{{ $i18n("Customer") }}</th>
        <th>{{ $i18n("Project/Task") }}</th>
        <th>{{ $i18n("Description") }}</th>
        <th class="report-right">{{ $i18n("Hours") }}</th>
      </tr>
      <tr v-for="rec of data" :key="rec.id">
        <td class="report-nowrap">{{ $i18nDate(rec.date) }}</td>
        <td class="report-nowrap" v-if="userId <= 0">{{ rec.user_name }}</td>
        <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
        <td>{{ rec.task_name }}</td>
        <td>{{ rec.description }}</td>
        <td class="report-right report-nowrap">
          {{ $i18nDecToHrs(rec.duration) }}
        </td>
      </tr>
      <tr>
        <th>{{ $i18n("Total") }}</th>
        <th v-if="userId <= 0"></th>
        <th v-if="customerId <= 0"></th>
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
      customerId: this.$route.query.customer,
      data: [],
      total: 0,
    }
  },

  methods: {
    // override mixin method
    groupData() {
    }
  },

  async mounted() {
    if (api.user.id == this.userId || api.user.hasRole('reporting')) {
      try {
        const intervalFilter = `filter[date][gte]=${this.from}&filter[date][lte]=${this.to}`
        const userFilter = this.userId > 0 ? `&filter[user_id][eq]=${this.userId}` : ''
        const customerFilter = this.customerId > 0 ? `&filter[customer_id][eq]=${this.customerId}` : ''
        const orderClause = `&order=date:ASC,customer_id:ASC`
        const url = `/timelog/report?${intervalFilter}${userFilter}${customerFilter}${orderClause}`
        const response = await api.get(url)
        this.data = response.data
        this.total = this.data.reduce((acc, rec) => acc + rec.duration, 0)
        this.groupData()
      } catch(e) {
        console.error(e)
      }
    }
  }
}
</script>

<style scoped>
@import "../assets/reports.css";
</style>