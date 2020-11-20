<template>
    <div class="report-container">
      <div class="report-title">{{ "Project time sheet by task" | i18n }}</div>
    <div>
      {{ "Project" | i18n }}: {{ project.name }}
    </div>
    <div class="report-subtitle">
      {{ "From" | i18n }} {{ from | i18nDate }} {{ "to" | i18n }} {{ to | i18nDate }}
      <span v-if="customerId > 0">- {{ "Customer" | i18n }}: {{ data[0].customer_name }}</span>
    </div>
      <table class="report-body">
        <tr>
          <th>{{ 'Date' | i18n }}</th>
          <th>{{ "Name" | i18n }}</th>
          <th v-if="customerId <= 0">{{ 'Customer' | i18n }}</th>
          <th>{{ 'Project/Task' | i18n }}</th>
          <th>{{ 'Description' | i18n }}</th>
          <th class="report-right">{{ 'Hours' | i18n }}</th>
        </tr>
        <template v-for="section in groupedData">
          <tr v-for="rec in section.data" :key="rec.id">
            <td class="report-nowrap">{{ rec.date | i18nDate }}</td>
            <td class="report-nowrap">{{ rec.user_name }}</td>
            <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
            <td>{{ rec.task_name }}</td>
            <td>{{ rec.description }}</td>
            <td class="report-right report-nowrap">{{ $i18nDecToHrs(rec.duration) }}</td>
          </tr>
          <tr :key="section.task">
            <th>{{ 'Subtotal' | i18n }}</th>
            <th></th>
            <th v-if="customerId <= 0"></th>
            <th>{{ section.task }}</th>
            <th></th>
            <th class="report-right">{{ $i18nDecToHrs(section.total) }}</th>
          </tr>
        </template>
        <tr>
          <th>{{ 'Total' | i18n }}</th>
          <th></th>
          <th v-if="customerId <= 0"></th>
          <th></th>
          <th></th>
          <th class="report-right">{{ $i18nDecToHrs(total) }}</th>
        </tr>
      </table>
    </div>
</template>

<script>
import ProjectTimeSheet from './ProjectTimeSheet'

export default {

  mixins: [ProjectTimeSheet],

  data() {
    return {
      groupedData: []
    }
  },

  methods: {
    groupData() {
      const groupedData = new Map()
      for (let rec of this.data) {
        if (!groupedData.has(rec.task_name)) {
          groupedData.set(rec.task_name, {
            data: [],
            total: 0,
            task: rec.task_name,
          })
        }
        const section = groupedData.get(rec.task_name)
        section.data.push(rec)
        section.total += rec.duration
      }
      this.groupedData = [...groupedData.values()]
    }
  }
}
</script>

<style scoped>
  @import '../assets/reports.css';
</style>