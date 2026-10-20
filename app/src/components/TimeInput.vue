<template>
  <v-text-field
   v-bind="$attrs"
   v-model="text"
   @change="onChange"
   :rules="inputRules"
   ref="timeInput"
  ></v-text-field>
</template>

<script>

const numToHrs = hrs => {
  if (hrs === null || hrs === undefined) {
    return ''
  }
  const hours = Math.floor(Math.abs(hrs))
  const mins = Math.round((Math.abs(hrs) - hours) * 60)
  return hours + ':' + (mins > 9 ? '' : '0') + mins
}

const hrsToNum = hrs => {
  // eslint-disable-next-line
  hrs = String(hrs ?? '').replace(/[^0-9\.:]/g, '')
  const num = Number(hrs)
  if (!isNaN(num)) {
    return num
  }
  const parts = hrs.split(':')
  return Number(parts[0]) + (parts.length > 1 ? (Number(parts[1]) / 60) : 0)
}

export default {

  name: 'TimeInput',

  inheritAttrs: false,

  props: {
    modelValue: {
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

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      text: numToHrs(this.modelValue),
      lastNumber: this.modelValue,
      inputRules: [ val => this.validate(val) ],
    }
  },

  methods: {
    onChange() {
      const number = Math.round(hrsToNum(this.text) * 100) / 100
      if (this.lastNumber !== number) {
        this.$emit('update:modelValue', number)
        this.$emit('change', number)
        this.lastNumber = number
      }
      this.text = numToHrs(number)
    },
    validate(val) {
      const text = String(val ?? '')
      const number = hrsToNum(text)
      if (isNaN(Number(text)) && !text.match(/^\d?\d:\d?\d?$/)) {
        return this.$i18n('Invalid time')
      }
      if (!this.allowZero && (text === '0:00' || number === 0)) {
        return this.$i18n('Must not be zero')
      }
      if (number > this.max) {
        return this.$i18n('May not exceed {1} hrs', this.max)
      }
      return true
    }
  },

  watch: {
    modelValue(value) {
      this.lastNumber = value
      this.text = numToHrs(value)
    }
  }
}
</script>
