<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <div class="page-title">{{ $i18n('Monthly Overview') }} / {{ $i18n('Total hours') }}: {{ totalHours }}</div>
          <v-spacer></v-spacer>
          <v-toolbar-title style="flex: 0 0 auto">
            {{ $refs.calendar ? $refs.calendar.title : 'This month' }}
          </v-toolbar-title>
          <v-btn color="grey darken-2" class="ml-2" @click="prev" icon size="small" variant="text">
            <v-icon size="small">mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn color="grey darken-2" class="mr-2" @click="next" icon size="small" variant="text">
            <v-icon size="small">mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn class="mr-4" color="black" @click="setToday" variant="outlined">
            {{ $i18n('Today') }}
          </v-btn>
        </v-toolbar>
      </v-sheet>
      <v-sheet :height="height">
        <v-calendar
          ref="calendar"
          type="month"
          color="primary"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          :first-day-of-week="1"
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
          <template v-slot:day="{ date }">
            <template v-if="records.has(date)">
          <div v-for="(record, i) in [records.get(date)]" :key="i">
              <div v-if="record.arrival" class="timeclock">
                <v-icon color="#1958b7" style="margin-top:-2px">mdi-arrow-right-bold</v-icon>
                <span>{{ record.arrival }}</span>
              </div>
              <div v-if="record.logged || record.clocked" class="timelog">
                <span v-if="record.clocked">{{ $i18nDecToHrs(record.clocked) }} {{ $i18n('clocked') }}</span>
                <hr v-if="record.logged && record.clocked"/>
                <span v-if="record.logged">{{ $i18nDecToHrs(record.logged) }} {{ $i18n('logged') }}</span>
              </div>
              <div v-if="record.departure" class="timeclock">
                <v-icon color="#1958b7" style="margin-top:-2px">mdi-arrow-left-bold</v-icon>
                <span>{{ record.departure }}</span>
              </div>
            </div>
          </template>
          </template>
        </v-calendar>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<style>
  .v-calendar-weekly__day-label .v-icon-btn {
    font-size: 1em;
    letter-spacing: 0.1em;
  }
  .v-calendar-weekly__day-label .v-icon-btn__content {
    font-size: 1rem !important;
    font-weight: 400 !important;
    --v-icon-btn-height: 40px;
  }
  .v-calendar-weekly__day-label .v-icon-btn--active {
    background-color: rgb(var(--v-theme-primary));
    color: white !important;
  }
  .v-calendar-weekly .v-calendar-weekly__weeknumber,
  .v-calendar-weekly .v-calendar-weekly__head-weeknumber {
    background-color: #f1f3f4 !important;
  }
  .v-calendar-weekly .v-calendar-weekly__head-weekday {
    background-color: white !important;
    color: black !important;
  }
  .v-calendar-weekly .v-calendar-weekly__head-weekday.v-past {
    color: #9e9e9e !important;
  }
  .v-calendar-weekly .v-calendar-weekly__head-weekday.v-present {
    color: rgb(var(--v-theme-primary)) !important;
  }
  .v-calendar-weekly .v-calendar-weekly__day.v-outside {
    background-color: #f7f7f7 !important;
  }
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
import { controlArrowDirection } from '../services/keyboard'

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
      window.addEventListener('keydown', this.onKeydown)
    },

    beforeUnmount() {
      window.removeEventListener('keydown', this.onKeydown)
    },

    methods: {
      onKeydown(event) {
        const direction = controlArrowDirection(event)
        if (direction === 0) {
          return
        }
        event.preventDefault()
        direction < 0 ? this.prev() : this.next()
      },
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
          this.height = response.data.length ? 800 : 600
          url = `/timeclock?filter[user_id]=${this.user.id}&filter[date][gte]=${val.start.date}&filter[date][lte]=${val.end.date}`
          response = await api.get(url)
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
      onClick(event, val) {
        this.$router.push(`/time-sheet/${val.date}`)
      }
    }
  }
</script>