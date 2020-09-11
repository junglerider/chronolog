<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <div class="page-title">{{ 'Weekly Overview' | i18n }} / {{ 'Total hours' | i18n }}: {{ totalHours }}</div>
          <v-spacer></v-spacer>
          <v-toolbar-title>
            {{ $refs.calendar ? $refs.calendar.title : 'This week' }}
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
          type="custom-weekly"
          color="primary"
          weekdays="1,2,3,4,5,6,0"
          :start="calendarDate"
          v-model="calendarDate"
          :show-month-on-first="false"
          :show-week="true"
          :shortWeekdays="false"
          :locale="$getLanguage()"
          @change="onChange"
          @click:date="onDateClick"
        >
        <template v-slot:day={date}>
          <div v-if="records.has(date)" :set="record=records.get(date)">
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
    methods: {
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
      onDateClick(val) {
        this.$router.push(`/time-sheet/${val.date}`)
      }
    },
  }
</script>