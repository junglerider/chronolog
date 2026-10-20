<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="$attrs"
        :label="label"
        :disabled="disabled"
        :model-value="formattedDate"
        readonly
      >
        <template #append-inner>
          <v-btn
            v-bind="props"
            icon color="grey"
            variant="text" size="small"
            tabindex="-1"
            :disabled="disabled"
          >
            <v-icon>mdi-calendar-month</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </template>
    <date-picker
      :model-value="modelValue"
      :max="max"
      :min="min"
      @update:model-value="onPick"
    ></date-picker>
  </v-menu>
</template>

<script>
import DatePicker from './DatePicker'

export default {

  name: 'DateInput',

  components: {
    DatePicker
  },

  inheritAttrs: false,

  props: {
    modelValue: String,
    label: String,
    max: String,
    min: String,
    disabled: Boolean
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      menu: false
    }
  },

  computed: {
    formattedDate() {
      if (!this.modelValue) {
        return null
      }
      return this.$i18nDate(this.modelValue)
    }
  },

  methods: {
    onPick(value) {
      this.menu = false
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    }
  }
}
</script>
