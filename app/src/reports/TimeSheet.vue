<template>
  <div class="report-container">
    <div class="report-title">{{ "Chronological time sheet" | i18n }}</div>
    <div>
      {{ "From" | i18n }} {{ from | i18nDate }} {{ "to" | i18n }}
      {{ to | i18nDate }}
    </div>
    <div class="report-subtitle">
      <span v-if="userId > 0 && data.length"
        >{{ "Name" | i18n }}: {{ data[0].user_name }}</span
      >
      <span v-if="customerId > 0 && data.length"
        >{{ "Customer" | i18n }}: {{ data[0].customer_name }}</span
      >
    </div>
    <table class="report-body">
      <tr>
        <th>{{ "Date" | i18n }}</th>
        <th v-if="userId <= 0">{{ "Name" | i18n }}</th>
        <th v-if="customerId <= 0">{{ "Customer" | i18n }}</th>
        <th>{{ "Project/Task" | i18n }}</th>
        <th>{{ "Description" | i18n }}</th>
        <th class="report-right">{{ "Hours" | i18n }}</th>
      </tr>
      <tr v-for="rec of data" :key="rec.id">
        <td class="report-nowrap">{{ rec.date | i18nDate }}</td>
        <td class="report-nowrap" v-if="userId <= 0">{{ rec.user_name }}</td>
        <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
        <td>{{ rec.task_name }}</td>
        <td>{{ rec.description }}</td>
        <td class="report-right report-nowrap">
          {{ $i18nDecToHrs(rec.duration) }}
        </td>
      </tr>
      <tr>
        <th>{{ "Total" | i18n }}</th>
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