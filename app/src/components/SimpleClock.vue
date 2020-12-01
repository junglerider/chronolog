<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">{{ localTimeDate.toLocaleTimeString() }}</span>
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

    destroyed() {
      clearInterval(this.clock)
    }
  }
</script>