<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <div class="page-title">{{ 'Monthly Overview' | i18n }} / {{ 'Total hours' | i18n }}: {{ totalHours }}</div>
          <v-spacer></v-spacer>
          <v-toolbar-title>
            {{ $refs.calendar ? $refs.calendar.title : 'This month' }}
          </v-toolbar-title>
          <v-btn fab text small color="grey darken-2" class="ml-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" class="mr-2" @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            {{ 'Today' | i18n }}
          </v-btn>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          type="month"
          color="primary"
          weekdays="1,2,3,4,5,6,0"
          v-model="focus"
          :show-month-on-first="false"
          :show-week="true"
          :shortWeekdays="false"
          :locale="$getLanguage()"
          :events="events"
          :event-color="getEventColor"
          @change="onChange"
          @click:date="onClick"
          @click:day="onClick"
        ></v-calendar>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<style>
  .v-calendar-weekly__day-label .v-btn {
    font-size: 1em !important;
    font-weight: 400;
  }
  .v-calendar-weekly__head-weekday {
    font-size: 1em !important;
  }
  .v-calendar .v-event {
    font-size: 1em !important;
  }
</style>

<script>
import api from '../services/api'

  export default {

    data: () => ({
      focus: '',
      userId: 1,
      totalHours: 0,
      events: [],
    }),

    mounted () {
      this.$refs.calendar.checkChange()
    },
    methods: {

      setToday () {
        this.focus = ''
      },

      prev () {
        this.$refs.calendar.prev()
      },

      next () {
        this.$refs.calendar.next()
      },

      getEventColor (event) {
        return event.color
      },

      async onChange(val) {
        let url = `/timelog/daily?filter[user_id]=${this.userId}&filter[date][gte]=${val.start.date}&filter[date][lte]=${val.end.date}`
        try {
          let response = await api.get(url)
          this.events = []
          let totalHours = 0
          for (let timelog of response.data) {
            totalHours += timelog.duration
            this.events.push({
              timed: false,
              start: timelog.date,
              name: this.$i18nDecToHrs(timelog.duration),
              color: '#2586d7',
            })
          }
          this.totalHours = totalHours
          url = `/timeclock?filter[user_id]=${this.userId}&filter[date][gte]=${val.start.date}&filter[date][lte]=${val.end.date}`
          response = await api.get(url)
          for (let timeclock of response.data) {
            this.events.push({
              timed: false,
              start: timeclock.date,
              name: this.$i18nDecToHrs(timeclock.work_duration),
              color: 'indigo',
            })
          }
        } catch (e) {
          console.error(e)
        }
      },

      onClick(val) {
        this.$router.push(`/time-sheet/${val.date}`)
      }
    }
  }
</script>