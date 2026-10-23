<template>
    <div class="report-container">
      <div class="report-title">{{ $i18n('Time sheet by task') }}</div>
      <div>{{ $i18n('From') }} {{ $i18nDate(from) }} {{ $i18n('to') }} {{ $i18nDate(to) }}</div>
      <div class="report-subtitle">
        <span v-if="userId > 0 && data.length">{{ $i18n('Name') }}: {{ data[0].user_name }}</span>
        <span v-if="customerId > 0 && data.length">{{ $i18n('Customer') }}: {{ data[0].customer_name }}</span>
      </div>
      <table class="report-body">
        <tr>
          <th>{{ $i18n('Date') }}</th>
          <th v-if="userId <= 0">{{ $i18n('Name') }}</th>
          <th v-if="customerId <= 0">{{ $i18n('Customer') }}</th>
          <th>{{ $i18n('Project/Task') }}</th>
          <th>{{ $i18n('Description') }}</th>
          <th class="report-right">{{ $i18n('Hours') }}</th>
        </tr>
        <template v-for="(section, sectionIndex) in groupedData" :key="sectionIndex">
          <tr v-for="rec in section.data" :key="rec.id">
            <td class="report-nowrap">{{ $i18nDate(rec.date) }}</td>
            <td class="report-nowrap" v-if="userId <= 0">{{ rec.user_name }}</td>
            <td v-if="customerId <= 0">{{ rec.customer_name }}</td>
            <td>{{ rec.task_name }}</td>
            <td>{{ rec.description }}</td>
            <td class="report-right report-nowrap">{{ $i18nDecToHrs(rec.duration) }}</td>
          </tr>
          <tr>
            <th>{{ $i18n('Subtotal') }}</th>
            <th v-if="userId <= 0"></th>
            <th v-if="customerId <= 0"></th>
            <th>{{ section.task }}</th>
            <th></th>
            <th class="report-right">{{ $i18nDecToHrs(section.total) }}</th>
          </tr>
        </template>
        <tr>
          <th>{{ $i18n('Total') }}</th>
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