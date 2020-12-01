<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    transition="scale-transition"
    max-width="300px"
    min-width="200px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-bind="$attrs"
        :label="label"
        :disabled="disabled"
        v-model="formattedDate"
        readonly
      >
        <v-btn
          v-bind="attrs"
          v-on="on"
          icon small color="grey"
          slot="append"
          tabindex="-1"
          :disabled="disabled"
        >
          <v-icon>mdi-calendar-month</v-icon>
        </v-btn>
      </v-text-field>
    </template>
    <v-date-picker
      v-bind:value="value"
      v-on:change="$emit('change', $event)"
      @input="menu = false"
      :locale="$getLanguage()"
      first-day-of-week="1"
      year-icon="mdi-dots-vertical"
      :max="max"
      :min="min"
    ></v-date-picker>
  </v-menu>
</template>

<script>
  export default {

    name: 'DateInput',
    model: {
      prop: 'value',
      event: 'change'
    },

    props: {
      value: String,
      label: String,
      max: String,
      min: String,
      disabled: Boolean
    },

    data() {
      return {
        menu: false
      }
    },

    computed: {
      formattedDate() {
        if (!this.value) {
          return null
        }
        return this.$i18nDate(this.value)
      }
    },
  }
</script>
