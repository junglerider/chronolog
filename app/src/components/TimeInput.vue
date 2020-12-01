<template>
  <v-text-field
   v-bind="$attrs"
   v-model="formattedValue"
   @change="onChange"
   @input="onInput"
   :rules="inputRules"
   ref="timeInput"
  ></v-text-field>
</template>

<script>

const numToHrs = hrs => {
  if (hrs === null) {
    return null
  }
  const hours = Math.floor(Math.abs(hrs))
  const mins = Math.round((Math.abs(hrs) - hours) * 60)
  return hours + ':' + (mins > 9 ? '' : '0') + mins
}

const hrsToNum = hrs => {
  // eslint-disable-next-line
  hrs = hrs.replace(/[^0-9\.:]/g, '')
  const num = Number(hrs)
  if (!isNaN(num)) {
    return num
  }
  const parts = hrs.split(':')
  return Number(parts[0]) + (parts.length > 1 ? (Number(parts[1]) / 60) : 0)
}

export default {

  name: 'TimeInput',

  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    value: {
      type: Number,
      default: null,
    },
    allowZero: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
    }
  },

  data() {
    return {
      number: this.value,
      lastNumber: this.value,
      inputRules: [ val => this.validate(val) ],
    }
  },

  methods: {
    onChange() {
      this.number = Math.round(this.number * 100) / 100
      if (this.lastNumber !== this.number) {
        this.$emit('change', this.number)
        this.lastNumber = this.number
      }
    },
    onInput() {
      this.$emit('input', this.number)
    },
    validate(val) {
      if (isNaN(Number(val)) && !val.match(/^\d?\d:\d?\d?$/)) {
        return this.$i18n('Invalid time')
      }
      if (!this.allowZero && (val === '0:00' || this.number === 0)) {
        return this.$i18n('Must not be zero')
      }
      if (this.number > this.max) {
        return this.$i18n('May not execed {1} hrs', this.max)
      }
      return true
    }
  },

  computed: {
    formattedValue: {
      get: function() {
        return numToHrs(this.value)
      },
      set: function(val)  {
        this.number = hrsToNum(val)
      }
    }
  },
}
</script>
