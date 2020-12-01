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
      <v-sheet :height="height">
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
          :event-color="getEventColor"
          @change="onChange"
          @click:date="onClick"
          @click:day="onClick"
        >
          <template v-slot:day={date}>
            <div v-if="records.has(date)" :set="record=records.get(date)">
              <div v-if="record.arrival" class="timeclock">
                <v-icon color="#1958b7" style="margin-top:-2px">mdi-arrow-right-bold</v-icon>
                <span>{{ record.arrival }}</span>
              </div>
              <div v-if="record.logged || record.clocked" class="timelog">
                <span v-if="record.clocked">{{ $i18nDecToHrs(record.clocked) }} {{ 'clocked' | i18n }}</span>
                <hr v-if="record.logged && record.clocked"/>
                <span v-if="record.logged">{{ $i18nDecToHrs(record.logged) }} {{ 'logged' | i18n }}</span>
              </div>
              <div v-if="record.departure" class="timeclock">
                <v-icon color="#1958b7" style="margin-top:-2px">mdi-arrow-left-bold</v-icon>
                <span>{{ record.departure }}</span>
              </div>
            </div>
          </template>
        </v-calendar>
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
  div.timeclock {
    color: #1958b7;
    margin: 4px 4px 2px 4px;
    font-size: 0.9em;
  }
  div.timelog {
    margin: 4px 4px 2px 4px;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 4px;
    background-color: #1958b7;
    color: white;
  }
  div.timelog hr {
    border-top: 1px dashed white;
    border-bottom: none;
  }
</style>

<script>
import api from '../services/api'

  export default {

    data: () => ({
      focus: '',
      height: 600,
      user: api.user,
      totalHours: 0,
      records: new Map(),
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
        const records = new Map()
        let url = `/timelog/daily?filter[user_id]=${this.user.id}&filter[date][gte]=${val.start.date}&filter[date][lte]=${val.end.date}`
        try {
          let response = await api.get(url)
          let totalHours = 0
          for (let timelog of response.data) {
            const record = records.has(timelog.date) ? records.get(timelog.date) : {}
            record.logged = timelog.duration
            records.set(timelog.date, record)
            totalHours += timelog.duration
          }
          this.totalHours = totalHours
          url = `/timeclock?filter[user_id]=${this.user.id}&filter[date][gte]=${val.start.date}&filter[date][lte]=${val.end.date}`
          response = await api.get(url)
          this.height = response.data.length ? 800 : 600
          for (let timeclock of response.data) {
            const record = records.has(timeclock.date) ? records.get(timeclock.date) : {}
            record.arrival = timeclock.arrival_time
            record.departure = timeclock.departure_time
            record.clocked = timeclock.work_duration
            records.set(timeclock.date, record)
          }
          this.records = records
        } catch (err) {
          console.error(err)
        }
      },
      onClick(val) {
        this.$router.push(`/time-sheet/${val.date}`)
      }
    }
  }
</script>