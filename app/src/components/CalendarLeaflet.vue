<template>
<v-card :elevation="4" height="100px" width="100px">
  <table class="calendar">
    <tr><td class="weekday" :style="{backgroundColor: colour || '#003086'}">
      {{ $i18n(today.toLocaleString('en', { weekday: 'long' })) }}
    </td></tr>
    <tr><td class="day" :class="{ weekend: [0, 6].includes(today.getDay()) }">
      {{ today.getDate() }}
    </td></tr>
    <tr><td class="month" :style="{color: colour || '#003086'}">
      {{ $i18n(today.toLocaleString('en', { month: 'long' })) }}
    </td></tr>
  </table>
</v-card>
</template>

<style scoped>
table.calendar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.6);
  width: 100px;
  height: 100px;
  border-collapse: collapse;
}
td.weekday {
  color: white;
  vertical-align: middle;
  text-align: center;
  font-weight: 500;
  padding: 2px;
}
td.day {
  height: 50%;
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
  font-family: Roboto, sans-serif;
  font-size: 2.5em;
  line-height: 0%;
  font-weight: 800;
}
td.day.weekend {
  color: crimson;
}
td.month {
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
  font-size: 100%;
  text-align: center;
  text-transform: uppercase;
  font-weight: 500;
}
</style>

<script>
export default {

  name: 'CalendarLeaflet',

  props: [ 'date', 'colour' ],

  data() {
    return {
      today: this.date ? new Date(this.date) : new Date()
    }
  },

  watch: {
    date() {
      this.today = this.date ? new Date(this.date) : new Date()
    }
  }
}
</script>
