<template>
  <v-tooltip location="bottom">
    <template v-slot:activator="{ props }">
      <span v-bind="props">{{ localTimeDate.toLocaleTimeString() }}</span>
    </template>
    <span>{{ localTimeDate.toLocaleDateString() }}</span>
  </v-tooltip>
</template>

<script>
  export default {

    name: 'SimpleClock',

    data() {
      return {
        localTimeDate: new Date(),
        clock: null
      }
    },

    created() {
      this.clock = setInterval(() => { this.localTimeDate = new Date() }, 1000)
    },

    unmounted() {
      clearInterval(this.clock)
    }
  }
</script>