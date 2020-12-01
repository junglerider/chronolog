<template>
  <v-container>
    <v-row>
      <v-col md="12">
        <div class="page-title">{{ 'Welcome back' | i18n }}{{ getUserName() }}!</div>
        {{ todaysDate }}
      </v-col>
    </v-row>
    <v-row>
      <v-col class="col-12 col-sm-6 form-col">
        <div style="display: flex; width: 100%; padding-top: 20px">
          <analogue-clock secondHandColour="#1976d2" style="flex: 60%; margin-right: 2vw; margin-left: 1vw;"/>
          <div style="flex: 40%; align-self: center;">
            <v-icon x-large class="centered">mdi-arrow-down-bold</v-icon>
            <v-btn
              :disabled="isPresent"
              @click="punchTheClock(1)"
              class="centered mb-4"
              primary
              color="primary"
            >{{ 'Check in' | i18n }}</v-btn>
            <div class="centered dotted-line">- - - - - - - - - -</div>
            <v-btn
              :disabled="!isPresent"
              @click="punchTheClock(0)"
              class="centered mt-4"
              primary
              color="primary"
              >{{ 'Check out' | i18n }}</v-btn>
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
                <td class="data">{{ (isPresent ? 'present' : 'absent') | i18n }}</td>
              </tr>
              <tr key="list-arrival">
                <td>{{ 'Arrival today' | i18n }}</td>
                <td class="data">{{ arrivalTime }}</td>
              </tr>
              <tr key="list-time-today">
                <td>{{ 'Working time today' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(workingTime) }}</td>
              </tr>
              <tr key="list-departure">
                <td>{{ 'Departure' | i18n }}</td>
                <td class="data">{{ departureTime }}</td>
              </tr>
              <tr key="list-hrs-today">
                <td>{{ 'Hours today' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(timeSheet.hoursToday) }}</td>
              </tr>
              <tr key="list-hrs-week">
                <td>{{ 'Hours this week' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(timeSheet.hoursThisWeek) }}</td>
              </tr>
              <tr key="list-hrs-month">
                <td>{{ 'Hours this month' | i18n }}</td>
                <td class="data">{{ $i18nDecToHrs(timeSheet.hoursThisMonth) }}</td>
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
import TimeClock from '../services/TimeClock'
import DateCalc from '../services/DateCalc'
import api from '../services/api'

export default {

  components: {
    AnalogueClock
  },

  data() {
    return {
      today: DateCalc.isoDate(),
      user: api.user,
      isPresent: false,
      arrivalTime: '-',
      workingTime: 0,
      departureTime: '-',
      timeSheet: {
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
    async punchTheClock() {
      const timeClockStatus = await TimeClock.punch(this.user.id)
      this.updatePunchClock(timeClockStatus)
    },
    updatePunchClock(timeClockStatus) {
      this.isPresent = timeClockStatus.arrival_time && !timeClockStatus.departure_time
      this.arrivalTime = timeClockStatus.arrival_time || '-'
      this.departureTime = timeClockStatus.departure_time || '-'
      this.workingTime = timeClockStatus.work_duration || 0
    },
    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },
    getUserName() {
      if (this.user.name) {
        return ', ' + (this.user.name.split(' '))[0]
      }
      return ''
    }
  },
  computed: {
    todaysDate() {
      const date = new Date()
      return this.$i18n(DateCalc.getWeekdayString(date, 'short')) + ', ' +
        this.$i18nDate(this.today) + ', ' +
        DateCalc.getTimeZoneString(date)
    }
  },

  async mounted() {
    try {
      const startOfWeek = DateCalc.isoDate(DateCalc.firstDayOfWeek(new Date()))
      const startOfMonth = DateCalc.isoDate(DateCalc.firstDayOfMonth(new Date()))
      let response = await api.get(`/timelog/sum?filter[user_id][eq]=${this.user.id}&filter[date][eq]=${this.today}`)
      this.timeSheet.hoursToday = response.data.duration
      response = await api.get(`/timelog/sum?filter[user_id][eq]=${this.user.id}&filter[date][gte]=${startOfWeek}`)
      this.timeSheet.hoursThisWeek = response.data.duration
      response = await api.get(`/timelog/sum?filter[user_id][eq]=${this.user.id}&filter[date][gte]=${startOfMonth}`)
      this.timeSheet.hoursThisMonth = response.data.duration
      const timeClockStatus = await TimeClock.read(this.user.id, this.today)
      await this.updatePunchClock(timeClockStatus)
    } catch(e) {
      this.showMessage('Record could not be loaded.', 'error')
    }
  }
}
</script>

