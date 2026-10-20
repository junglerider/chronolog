<template>
  <v-text-field
   v-bind="$attrs"
   :model-value="shownValue"
   @update:model-value="onType"
   @update:focused="onFocusChange"
   @change="onChange"
   :reverse="true"
   class="currency-input"
  ></v-text-field>
</template>

<style scoped>
  .currency-input :deep(input) {
    text-align: right;
  }
</style>

<script>
import NumberFormat from '../services/NumberFormat'

export default {

  name: 'CurrencyInput',

  inheritAttrs: false,

  props: {
    modelValue: {
      type: [Number, String],
      default: 0,
    },
    locale: {
      type: String,
    },
    currency: {
      type: String,
      default: '',
    },
    allowNegative: {
      type: Boolean,
      default: true,
    }
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      isFocused: false,
      text: '',
      number: this.modelValue,
      lastNumber: this.modelValue,
    }
  },

  computed: {
    formatter() {
      return new NumberFormat(this.locale, this.currency)
    },
    shownValue() {
      return this.isFocused ? this.text : this.format(this.modelValue)
    }
  },

  methods: {
    format(val) {
      if (val === null || val === undefined) {
        return 0
      }
      return this.formatter.formatAmount(val)
    },
    onType(val) {
      this.text = val ?? ''
      const neg = (this.allowNegative && this.text[0] === '-') ? -1 : 1
      // eslint-disable-next-line
      this.number = Number(this.text.replace(/[^0-9\.]/g, '')) * neg
    },
    onChange() {
      this.number = Math.round(this.number * 100) / 100
      if (this.lastNumber !== this.number) {
        this.$emit('update:modelValue', this.number)
        this.$emit('change', this.number)
        this.lastNumber = this.number
      }
    },
    onFocusChange(focused) {
      if (focused) {
        this.number = this.modelValue
        this.text = String(this.modelValue ?? '')
      }
      this.isFocused = focused
    }
  },

  watch: {
    modelValue(value) {
      this.number = value
      this.lastNumber = value
    }
  }
}
</script>
