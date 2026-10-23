<template>
  <v-date-picker
    :model-value="date"
    :min="toDate(min)"
    :max="toDate(max)"
    first-day-of-week="1"
    :title="year"
    color="primary"
    header-color="primary"
    elevation="6"
    class="app-date-picker"
    @update:model-value="onUpdate"
  ></v-date-picker>
</template>

<script>
import DateCalc from '../services/DateCalc'

// Vuetify 3 date pickers work with Date objects; the application stores ISO date strings.
export default {

  name: 'DatePicker',

  props: {
    modelValue: String,
    min: String,
    max: String
  },

  emits: ['update:modelValue'],

  computed: {
    year() {
      return String((this.date || new Date()).getFullYear())
    },
    date() {
      return this.toDate(this.modelValue)
    }
  },

  methods: {
    toDate(value) {
      const matches = typeof value === 'string' && value.match(/^(\d{4})-(\d\d)-(\d\d)/)
      return matches ? new Date(Number(matches[1]), Number(matches[2]) - 1, Number(matches[3])) : undefined
    },
    onUpdate(value) {
      this.$emit('update:modelValue', value ? DateCalc.isoDate(value) : null)
    }
  }
}
</script>

<style>
  .app-date-picker .v-picker-title {
    color: white;
    font-size: 0.85rem;
    letter-spacing: normal;
    text-transform: none;
  }
  .app-date-picker .v-date-picker-header__content {
    color: white;
    font-size: 1.5rem;
    font-weight: 500;
  }
  .app-date-picker .v-date-picker-header {
    padding-top: 12px;
    padding-bottom: 8px;
    min-height: 0;
    height: auto;
    align-items: flex-start;
  }
  .app-date-picker .v-date-picker-header {
    background-color: rgb(var(--v-theme-primary));
    border-radius: 4px 4px 0 0;
  }
</style>
