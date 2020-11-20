<template>
  <div class="report-container">
    <div class="report-title">{{ "Project time sheet" | i18n }}</div>
    <div>
      {{ "Project" | i18n }}: {{ project.name }}
    </div>
    <div class="report-subtitle">
      {{ "From" | i18n }} {{ from | i18nDate }} {{ "to" | i18n }} {{ to | i18nDate }}
      <span v-if="customerId > 0">- {{ "Customer" | i18n }}: {{ data[0].customer_name }}</span>
    </div>
    <table class="report-body">
      <tr>
        <th>{{ "Date" | i18n }}</th>
        <th>{{ "Name" | i18n }}</th>
        <th v-if="customerId <= 0">{{ "Customer" | i18n }}</th>
        <th>{{ "Project/Task" | i18n }}</th>
        <th>{{ "Description" | i18n }}</th>
        <th class="report-right">{{ "Hours" | i18n }}</th>
      </tr>
      <tr v-for="rec of data" :key="rec.id">
        <td class="report-nowrap">{{ rec.date | i18nDate }}</td>
        <td class="report-nowrap">{{ rec.user_name }}</td>
        <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
        <td>{{ rec.task_name }}</td>
        <td>{{ rec.description }}</td>
        <td class="report-right report-nowrap">
          {{ $i18nDecToHrs(rec.duration) }}
        </td>
      </tr>
      <tr>
        <th>{{ "Total" | i18n }}</th>
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