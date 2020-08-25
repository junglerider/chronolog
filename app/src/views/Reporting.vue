<template>
  <v-form ref="form">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'Reporting' | i18n }}</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete :label="'Report' | i18n" :items="reports" v-model="report.name"></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            :label="'User' | i18n"
            :items="users"
            v-model="report.userId"
            item-value="id"
            item-text="name"
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            :label="'Customer' | i18n"
            :items="customers"
            v-model="report.customerId"
            item-value="id"
            item-text="name"
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-select
            :label="'Period' | i18n"
            :items="periods"
            v-model="report.period"
            @change="onSelectPeriod"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <date-input :label="'Start date' | i18n" v-model="report.start"></date-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <date-input :label="'End date' | i18n" v-model="report.end"></date-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col pt-3">
          <v-btn color="primary" @click="onGenerate">{{ 'Generate' | i18n }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import DateInput from '../components/DateInput'
import DateCalc from '../services/DateCalc.js'
import reports from '../reports'
import api from '../services/api'

const MSPDAY = 86400000

export default {
  components: {
    DateInput,
  },

  data() {
    return {
      reports: reports.map(report => { return { ...report, text: this.$i18n(report.text)}} ),
      periods: [
        { value: 'today', text: this.$i18n('Today') },
        { value: 'thisWeek', text: this.$i18n('This week') },
        { value: 'lastWeek', text: this.$i18n('Last week') },
        { value: 'thisMonth', text: this.$i18n('This month') },
        { value: 'lastMonth', text: this.$i18n('Last month') },
        { value: 'lastThreeMonths', text: this.$i18n('Last three months') },
        { value: 'lastSixMonths', text: this.$i18n('Last six months') },
        { value: 'thisYear', text: this.$i18n('This year') },
        { value: 'lastYear', text: this.$i18n('Last year') },
      ],
      users: [],
      customers: [],
      report: {
        name: 'time-sheet',
        period: 'lastMonth',
        start: null,
        end: null,
        userId: 1,
        customerId: 0,
      }
    }
  },

  methods: {
    onGenerate() {
      window.open(`/reports/${this.report.name}?user=${this.report.userId}&customer=${this.report.customerId}&start=${this.report.start}&end=${this.report.end}`, '_blank')
    },

    onSelectPeriod(period) {
      let startDate = new Date()
      let endDate = new Date()
      switch (period)
      {
        case 'today':
           break
        case 'thisWeek':
          startDate = DateCalc.firstDayOfWeek(startDate)
          endDate = DateCalc.lastDayOfWeek(endDate)
          break
        case 'lastWeek':
          startDate.setTime(startDate.getTime() - (7 * MSPDAY))
          endDate.setTime(endDate.getTime() - (7 * MSPDAY))
          startDate = DateCalc.firstDayOfWeek(startDate)
          endDate = DateCalc.lastDayOfWeek(endDate)
          break
        case 'thisMonth':
          startDate = DateCalc.firstDayOfMonth(startDate)
          endDate = DateCalc.lastDayOfMonth(endDate)
          break
        case 'lastMonth':
          startDate.setMonth(startDate.getMonth() - 1)
          endDate.setMonth(endDate.getMonth() - 1)
          startDate = DateCalc.firstDayOfMonth(startDate)
          endDate = DateCalc.lastDayOfMonth(endDate)
          break
        case 'lastThreeMonths':
          startDate.setMonth(startDate.getMonth() - 3)
          startDate = DateCalc.firstDayOfMonth(startDate)
          endDate = DateCalc.lastDayOfMonth(endDate)
          break
        case 'lastSixMonths':
          startDate.setMonth(startDate.getMonth() - 6)
          startDate = DateCalc.firstDayOfMonth(startDate)
          endDate = DateCalc.lastDayOfMonth(endDate)
          break
        case 'thisYear':
          startDate.setDate(1)
          startDate.setMonth(0)
          endDate.setMonth(11)
          endDate.setDate(31)
          break
        case 'lastYear':
          startDate.setYear(startDate.getYear()+1899)
          startDate.setMonth(0)
          startDate.setDate(1)
          endDate.setYear(endDate.getYear()+1899)
          endDate.setMonth(11)
          endDate.setDate(31)
          break
        default: return
      }
      this.report.start = this.$i18nIsoDate(startDate)
      this.report.end = this.$i18nIsoDate(endDate)
    }
  },

  async mounted() {
    this.onSelectPeriod('lastMonth')
    let response
    try {
      response = await api.get('/user?filter[is_active][eq]=1')
      this.users = response.data
      this.users.unshift({id: 0, name: this.$i18n('All users')})
      response = await api.get('/customer?filter[is_retired][eq]=0')
      this.customers = response.data
      this.customers.unshift({id: 0, name: this.$i18n('All customers')})
    } catch(e) {
      console.error(e)
    }
  },

}
</script>