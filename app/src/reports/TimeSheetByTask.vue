<template>
    <div class="report-container">
      <div class="report-title">{{ 'Time sheet by task' | i18n }}</div>
      <div>{{ 'From' | i18n }} {{ from | i18nDate }} {{ 'to' | i18n }} {{ to | i18nDate }}</div>
      <div class="report-subtitle">
        <span v-if="userId > 0 && data.length">{{ 'Name' | i18n }}: {{ data[0].user_name }}</span>
        <span v-if="customerId > 0 && data.length">{{ 'Customer' | i18n }}: {{ data[0].customer_name }}</span>
      </div>
      <table class="report-body">
        <tr>
          <th>{{ 'Date' | i18n }}</th>
          <th v-if="userId <= 0">{{ 'Name' | i18n }}</th>
          <th v-if="customerId <= 0">{{ 'Customer' | i18n }}</th>
          <th>{{ 'Project/Task' | i18n }}</th>
          <th>{{ 'Description' | i18n }}</th>
          <th class="report-right">{{ 'Hours' | i18n }}</th>
        </tr>
        <template v-for="section in groupedData">
          <tr v-for="rec in section.data" :key="rec.id">
            <td class="report-nowrap">{{ rec.date | i18nDate }}</td>
            <td class="report-nowrap" v-if="userId <= 0">{{ rec.user_name }}</td>
            <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
            <td>{{ rec.task_name }}</td>
            <td>{{ rec.description }}</td>
            <td class="report-right report-nowrap">{{ $i18nDecToHrs(rec.duration) }}</td>
          </tr>
          <tr :key="section.task">
            <th>{{ 'Subtotal' | i18n }}</th>
            <th v-if="userId <= 0"></th>
            <th v-if="customerId <= 0"></th>
            <th>{{ section.task }}</th>
            <th></th>
            <th class="report-right">{{ $i18nDecToHrs(section.total) }}</th>
          </tr>
        </template>
        <tr>
          <th>{{ 'Total' | i18n }}</th>
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
import TimeSheet from './TimeSheet'

export default {

  mixins: [TimeSheet],

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