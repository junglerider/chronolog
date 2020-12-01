<template>
  <div>
    <template v-for="line in split(value)">
      <template>{{ line }}<br :key="line"/></template>
    </template>
  </div>
</template>

<script>
export default {

  name: 'TextBlock',

  props: {
    value: {
      type: String,
      default: '',
    },
  },

  methods: {
    split(value) {
      return String(value).split(/[\r|\n]/)
    }
  },
}
</script>
