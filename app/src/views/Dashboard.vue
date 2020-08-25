<template>
  <v-container>
    <v-row>
      <v-col md="12">
        <div class="page-title">{{ 'Welcome back' | i18n }}, {{ user.nick_name || user.first_name }}!</div>
        {{ today.toLocaleString('en', { weekday: 'short' }) | i18n }},
        {{ $i18nIsoDate(today) | i18nDate }}
        {{ String(today).substr(34) }}

      </v-col>
    </v-row>
    <v-row>
      <v-col class="col-12 col-sm-6 form-col">
        <div style="display: flex; width: 100%; padding-top: 20px">
          <analogue-clock secondHandColour="#1976d2" style="flex: 60%; margin-right: 2vw; margin-left: 1vw;"/>
          <div style="flex: 40%; align-self: center;">
            <v-icon x-large class="centered">mdi-arrow-down-bold</v-icon>
            <v-btn primary color="primary" class="centered mb-4">{{ 'Check in' | i18n }}</v-btn>
            <div class="centered dotted-line">- - - - - - - - - -</div>
            <v-btn primary color="primary" class="centered mt-4" :disabled="true">{{ 'Check out' | i18n }}</v-btn>
            <v-icon x-large class="centered">mdi-arrow-down-bold</v-icon>
          </div>
        </div>
      </v-col>
      <v-col class="col-12 col-sm-6 col-md-4 form-col">
        <v-simple-table>
          <template v-slot:default>
            <tbody>
              <tr key="list-status">
                <td>{{ 'Status' | i18n }}</td>
                <td class="data">{{ data.status }}</td>
              </tr>
              <tr key="list-arrival">
                <td>{{ 'Arrival today' | i18n }}</td>
                <td class="data">{{ data.arrival }}</td>
              </tr>
              <tr key="list-time-today">
                <td>{{ 'Working time today' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(data.timeToday) }}</td>
              </tr>
              <tr key="list-time-week">
                <td>{{ 'Working time this week' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(data.timeThisWeek) }}</td>
              </tr>
              <tr key="list-hrs-today">
                <td>{{ 'Hours today' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(data.hoursToday) }}</td>
              </tr>
              <tr key="list-hrs-week">
                <td>{{ 'Hours this week' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(data.hoursThisWeek) }}</td>
              </tr>
              <tr key="list-hrs-month">
                <td>{{ 'Hours this month' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(data.hoursThisMonth) }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
      <v-icon v-if="messageColor == 'info'" color="blue">mdi-alert-outline</v-icon>
      {{ messageText }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
  .centered {
    display: block;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
  .dotted-line {
    font-size: 2vw;
  }
  .data {
    text-align: right;
  }
</style>

<script>
import AnalogueClock from '../components/AnalogueClock'
import DateCalc from '../services/DateCalc'
import api from '../services/api'

export default {
  components: {
    AnalogueClock
  },

  data() {
    return {
      today: new Date(),
      startOfWeek: DateCalc.firstDayOfWeek(new Date()),
      startOfMonth: DateCalc.firstDayOfMonth(new Date()),
      userId: 1,
      user: {},
      data: {
        status: this.$i18n('absent'),
        arrival: '?',
        timeToday: 0,
        timeThisWeek: 0,
        hoursToday: 0,
        hoursThisWeek: 0,
        hoursThisMonth: 0
      },
      message: false,
      messageColor: 'success',
      messageText: '',
    }
  },
  methods: {
    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },
  },

  async mounted() {
    try {
      let response = await api.get(`/user/${this.userId}`)
      this.user = response.data
      response = await api.get(`/timelog/sum?filter[user_id][eq]=${this.userId}&filter[date][eq]=${this.$i18nIsoDate(this.today)}`)
      this.data.hoursToday = response.data.duration
      response = await api.get(`/timelog/sum?filter[user_id][eq]=${this.userId}&filter[date][gte]=${this.$i18nIsoDate(this.startOfWeek)}`)
      this.data.hoursThisWeek = response.data.duration
      response = await api.get(`/timelog/sum?filter[user_id][eq]=${this.userId}&filter[date][gte]=${this.$i18nIsoDate(this.startOfMonth)}`)
      this.data.hoursThisMonth = response.data.duration
    } catch(e) {
      this.showMessage('Record could not be loaded.', 'error')
    }
  }

}
</script>

