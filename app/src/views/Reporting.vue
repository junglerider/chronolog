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
      <v-row v-show="user.hasRole('reporting') && !isProjectSheet()">
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
      <v-row v-show="report.name !== 'working-time'">
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
      <v-row v-show="isProjectSheet()">
        <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            :label="'Project' | i18n"
            :items="projects"
            v-model="report.projectId"
            item-value="id"
            item-text="name"
          ></v-autocomplete>
        </v-col>
      </v-row>
      <div v-show="report.name !== 'todo-list'">
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
     </div>
    </v-container>
  </v-form>
</template>

<script>
import DateInput from '../components/DateInput'
import DateCalc from '../services/DateCalc.js'
import reports from '../reports'
import api from '../services/api'

export default {
  components: {
    DateInput,
  },

  data() {
    return {
      user: api.user,
      reports: reports
        .filter(report => !report.access || api.user.hasRole(report.access))
        .map(report => { return { ...report, text: this.$i18n(report.text)}} ),
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
      projects: [],
      report: {
        name: 'time-sheet',
        period: 'lastMonth',
        start: null,
        end: null,
        userId: api.user.id,
        customerId: 0,
        projectId: 0,
      }
    }
  },

  methods: {
    onGenerate() {
      let url = `/reports/${this.report.name}?customer=${this.report.customerId}&start=${this.report.start}&end=${this.report.end}`
      if (this.isProjectSheet()) {
        url += `&project=${this.report.projectId}`
      } else {
        url += `&user=${this.report.userId}`
      }
      window.open(url, '_blank')
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
          startDate.setDate(startDate.getDate() - 7)
          endDate.setDate(endDate.getDate() - 7)
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
          startDate = new Date(startDate.getFullYear(), 0, 1)
          endDate = new Date(endDate.getFullYear(), 11, 31)
          break
        case 'lastYear':
          startDate = new Date(startDate.getFullYear() - 1, 0, 1)
          endDate = new Date(endDate.getFullYear() - 1, 11, 31)
          break
        default: return
      }
      this.report.start = DateCalc.isoDate(startDate)
      this.report.end = DateCalc.isoDate(endDate)
    },

    isProjectSheet() {
      return [
        'project-time-sheet',
        'project-time-sheet-by-task',
        'project-time-sheet-by-contributor',
      ].includes(this.report.name)
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
      response = await api.get('/task/projects?filter[is_leaf][eq]=0&filter[is_closed][eq]=0&order=id:desc')
      this.projects = response.data
      if (this.projects.length) {
        this.report.projectId = this.projects[0].id
      }
    } catch(e) {
      console.error(e)
    }
  },

}
</script>