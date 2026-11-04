<template>
  <div class="text-block">{{ value }}</div>
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
}
</script>

<style scoped>
.text-block {
  white-space: pre-line;
}
</style>
