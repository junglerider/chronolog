<template>
  <v-text-field
   v-bind="$attrs"
   v-model="formattedValue"
   @change="onChange"
   @input="onInput"
   @blur="onBlur"
   @focus="onFocus"
   :suffix="suffix"
   :prefix="prefix"
   :reverse="true"
  ></v-text-field>
</template>

<script>
import NumberFormat from '../services/NumberFormat'

export default {
  name: 'CurrencyInput',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
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
  data() {
    return {
      isFocused: false,
      number: this.value,
      lastNumber: this.value,
      formatter: new NumberFormat(this.locale, this.currency),
      prefix: null,
      suffix: null,
    }
  },
  methods: {
    format(val) {
      if (val === null) {
        return 0
      }
      return this.formatter.format(val)
    },
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
    onBlur() {
      this.isFocused = false
    },
    onFocus() {
      this.isFocused = true
    },
    updateFormat() {
      this.formatter = new NumberFormat(this.locale, this.currency)
      if (this.locale === 'en') {
        this.suffix = this.formatter.currencySign
      } else {
        this.prefix = this.formatter.currencySign
      }
    }
  },
  computed: {
    formattedValue: {
      get: function() {
        return this.isFocused ? this.value : this.format(this.value)
      },
      set: function(val)  {
        const neg = (this.allowNegative && val && val[0] === '-') ? -1 : 1
        // eslint-disable-next-line
        this.number = Number(val.replace(/[^0-9\.]/g, '')) * neg
      }
    }
  },
  watch: {
    currency() {
      this.updateFormat()
    },
    locale() {
      this.updateFormat()
    },
  },
  mounted() {
    this.updateFormat()
  }
}
</script>
