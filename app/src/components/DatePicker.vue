<template>
  <v-date-picker
    :model-value="date"
    :min="toDate(min)"
    :max="toDate(max)"
    first-day-of-week="1"
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
