<template>
  <v-list-item :key="locale" @click="onClick(locale)">
    <v-list-item-title>
      <img class="app-flag mr-3" style="width: 25px" :src="`/images/flags/${locale}.svg`" />
      {{ name }}
    </v-list-item-title>
  </v-list-item>
</template>

<script>
export default {
  name: 'LangMenuItem',
  props: {
    locale: String,
    name: String,
  },
  methods: {
    onClick(locale) {
      this.$emit('clicked', locale)
    }
  }
}
</script>