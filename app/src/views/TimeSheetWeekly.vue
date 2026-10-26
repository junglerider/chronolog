<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64" color="background">
        <v-toolbar flat color="background">
          <div class="page-title">{{ $i18n('Weekly Overview') }} / {{ $i18n('Total hours') }}: {{ totalHours }}</div>
          <v-spacer></v-spacer>
          <v-toolbar-title style="flex: 0 0 auto">
            {{ $refs.calendar ? $refs.calendar.title : 'This week' }}
          </v-toolbar-title>
          <v-btn color="on-surface" class="ml-2" @click="prev" icon size="small" variant="text">
            <v-icon size="small">mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn color="on-surface" class="mr-2" @click="next" icon size="small" variant="text">
            <v-icon size="small">mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn class="mr-4" color="on-surface" @click="setToday" variant="outlined">
            {{ $i18n('Today') }}
          </v-btn>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          type="custom-weekly"
          color="primary"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          :first-day-of-week="1"
          :start="calendarDate"
          v-model="calendarDate"
          :show-month-on-first="false"
          :show-week="true"
          :shortWeekdays="false"
          :locale="$getLanguage()"
          @change="onChange"
          @click:date="onDateClick"
        >
        <template v-slot:day="{ date }">
          <template v-if="records.has(date)">
          <div v-for="(record, i) in [records.get(date)]" :key="i">
            <div v-if="record.arrival" class="timeclock">
              <v-icon color="#1958b7" style="margin-top:-2px">mdi-arrow-right-bold</v-icon>
              <span>{{ record.arrival }}</span>
            </div>
            <div
              v-for="timelog in record.timelog"
              :title="timelog.description"
              :key="timelog.id"
              :style="'background-color:' + assignColour(timelog.task_id)"
              class="timelog"
            >
              <span>{{ $i18nDecToHrs(timelog.duration) }}</span> <hr/>
              <span>{{ timelog.task_name }}</span> <hr/>
              <span style="font-size: 0.8em">{{ timelog.customer_name }}</span>
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
    background-color: rgb(var(--v-theme-surface-light)) !important;
  }
  .v-calendar-weekly .v-calendar-weekly__head-weekday {
    background-color: rgb(var(--v-theme-surface)) !important;
    color: rgb(var(--v-theme-on-surface)) !important;
  }
  .v-calendar-weekly .v-calendar-weekly__head-weekday.v-past {
    color: rgba(var(--v-theme-on-surface), 0.6) !important;
  }
  .v-calendar-weekly .v-calendar-weekly__head-weekday.v-present {
    color: rgb(var(--v-theme-primary)) !important;
  }
  .v-calendar-weekly .v-calendar-weekly__day.v-outside {
    background-color: rgb(var(--v-theme-surface)) !important;
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
    color: white;
  }
  div.timelog hr {
    border-top: 1px dashed white;
    border-bottom: none;
  }
</style>

<script>
  import api from '../services/api'
  import dateCalc from '../services/DateCalc'
  import { controlArrowDirection } from '../services/keyboard'

  const colourPool = [
    '#5e84ea', '#003086',
    '#90bade', '#608aac',
    '#304ffe', '#7a7cff', '#0026ca',
    '#00796b', '#48a999', '#004c40',
    '#880e4f', '#bc477b', '#560027',
    '#4a148c', '#7c43bd', '#12005e'
  ]

  export default {

    data: () => ({
      calendarDate: dateCalc.firstDayOfWeek(new Date()),
      user: api.user,
      totalHours: 0,
      records: new Map(),
      taskColours: new Map(),
      colourPool: [...colourPool]
    }),

    mounted() {
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
        this.calendarDate = dateCalc.firstDayOfWeek(new Date())
      },
      prev () {
        const d = this.calendarDate
        this.calendarDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)
      },
      next () {
        const d = this.calendarDate
        this.calendarDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
      },
      assignColour(taskId) {
        if (this.taskColours.has(taskId)) {
          return this.taskColours.get(taskId)
        }
        if (this.colourPool.length === 0) {
          this.colourPool = [...colourPool]
        }
        const colourIndex = Math.floor(Math.random() * this.colourPool.length)
        const colour = this.colourPool[colourIndex]
        this.taskColours.set(taskId, colour)
        this.colourPool.splice(colourIndex, 1)
        return colour
      },
      async onChange(val) {
        const records = new Map()
        const endDate = dateCalc.isoDate(dateCalc.lastDayOfWeek(new Date(val.start.date)))
        let url = `/timelog?filter[user_id]=${this.user.id}&filter[date][gte]=${val.start.date}&filter[date][lte]=${endDate}`
        try {
          let response = await api.get(url)
          let totalHours = 0
          for (let timelog of response.data) {
            const record = records.has(timelog.date) ? records.get(timelog.date) : {
              timelog: []
            }
            record.timelog.push(timelog)
            records.set(timelog.date, record)
            totalHours += timelog.duration
          }
          this.totalHours = totalHours
          url = `/timeclock?filter[user_id]=${this.user.id}&filter[date][gte]=${val.start.date}&filter[date][lte]=${endDate}`
          response = await api.get(url)
          for (let timeclock of response.data) {
            const record = records.has(timeclock.date) ? records.get(timeclock.date) : {}
            record.arrival = timeclock.arrival_time
            record.departure = timeclock.departure_time
            records.set(timeclock.date, record)
          }
          this.records = records
        } catch (err) {
          console.error(err)
        }
      },
      onDateClick(event, val) {
        this.$router.push(`/time-sheet/${val.date}`)
      }
    },
  }
</script>