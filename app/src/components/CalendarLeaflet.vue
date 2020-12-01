<template>
<v-card :elevation="4" height="100px" width="100px">
  <table class="calendar">
    <tr><td class="weekday" :style="{backgroundColor: colour || '#003086'}">
      {{ today.toLocaleString('en', { weekday: 'long' }) | i18n }}
    </td></tr>
    <tr><td class="day" :style="{color: [0, 6].includes(today.getDay())? 'crimson' : 'black' }">
      {{ today.getDate() }}
    </td></tr>
    <tr><td class="month" :style="{color: colour || '#003086'}">
      {{ today.toLocaleString('en', { month: 'long' }) | i18n }}
    </td></tr>
  </table>
</v-card>
</template>

<style scoped>
table.calendar {
  border: 1px solid black;
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
  background-color: white;
  text-align: center;
  font-family: Roboto, sans-serif;
  font-size: 2.5em;
  line-height: 0%;
  font-weight: 800;
}
td.month {
  background-color: white;
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
