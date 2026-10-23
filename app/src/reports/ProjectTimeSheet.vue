<template>
  <div class="report-container">
    <div class="report-title">{{ $i18n("Project time sheet") }}</div>
    <div>
      {{ $i18n("Project") }}: {{ project.name }}
    </div>
    <div class="report-subtitle">
      {{ $i18n("From") }} {{ $i18nDate(from) }} {{ $i18n("to") }} {{ $i18nDate(to) }}
      <span v-if="customerId > 0">- {{ $i18n("Customer") }}: {{ data[0].customer_name }}</span>
    </div>
    <table class="report-body">
      <tr>
        <th>{{ $i18n("Date") }}</th>
        <th>{{ $i18n("Name") }}</th>
        <th v-if="customerId <= 0">{{ $i18n("Customer") }}</th>
        <th>{{ $i18n("Project/Task") }}</th>
        <th>{{ $i18n("Description") }}</th>
        <th class="report-right">{{ $i18n("Hours") }}</th>
      </tr>
      <tr v-for="rec of data" :key="rec.id">
        <td class="report-nowrap">{{ $i18nDate(rec.date) }}</td>
        <td class="report-nowrap">{{ rec.user_name }}</td>
        <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
        <td>{{ rec.task_name }}</td>
        <td>{{ rec.description }}</td>
        <td class="report-right report-nowrap">
          {{ $i18nDecToHrs(rec.duration) }}
        </td>
      </tr>
      <tr>
        <th>{{ $i18n("Total") }}</th>
        <th v-if="customerId <= 0"></th>
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
      customerId: this.$route.query.customer,
      projectId: this.$route.query.project,
      project: {},
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
    if (api.user.hasRole('reporting')) {
      try {
        let response = await api.get(`/task/${this.projectId}`)
        this.project = response.data
        response = await api.get(`/task/${this.projectId}/descendants`)
        const projectIds = response.data
        projectIds.unshift(Number(this.projectId))
        const projectFilter = `?filter[task_id][in]=${projectIds.join(',')}`
        const intervalFilter = `&filter[date][gte]=${this.from}&filter[date][lte]=${this.to}`
        const customerFilter = this.customerId > 0 ? `&filter[customer_id][eq]=${this.customerId}` : ''
        const orderClause = `&order=date:ASC,customer_id:ASC`
        const url = `/timelog/report${projectFilter}${intervalFilter}${customerFilter}${orderClause}`
        response = await api.get(url)
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