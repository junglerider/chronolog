<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on" color="white" class="mr-4">
        <img style="width: 30px" :src="`/images/flags/${selectedLanguage}.svg`"/>
      </v-btn>
    </template>

    <v-list>
      <lang-menu-item locale="en" :name="$i18n('English')" @clicked="selectLanguage"/>
      <lang-menu-item locale="de" :name="$i18n('German')" @clicked="selectLanguage"/>
      <lang-menu-item locale="fr" :name="$i18n('French')" @clicked="selectLanguage"/>
      <lang-menu-item locale="es" :name="$i18n('Spanish')" @clicked="selectLanguage"/>
      <lang-menu-item locale="it" :name="$i18n('Italian')" @clicked="selectLanguage"/>
    </v-list>

  </v-menu>
</template>

<script>
import LangMenuItem from './LangMenuItem'

export default {

  name: 'LanguageMenu',

  components: {
    LangMenuItem
  },

  data() {
    return {
      selectedLanguage: this.$getLanguage(),
      selectLanguage: async language => {
        this.selectedLanguage = language
        await this.$setLanguage(language)
        this.$forceUpdate()
        this.$emit('changeLanguage')
      }
  }}
}

</script>
