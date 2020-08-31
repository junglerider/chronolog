<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on" color="white" class="mr-4">
        <img style="width: 30px" :src="`/images/flags/${selectedLanguage}.svg`"/>
      </v-btn>
    </template>

    <v-list>
      <lang-menu-item locale="en" :name="'English' | i18n" @clicked="selectLanguage"/>
      <lang-menu-item locale="de" :name="'German' | i18n" @clicked="selectLanguage"/>
      <lang-menu-item locale="fr" :name="'French' | i18n" @clicked="selectLanguage"/>
      <lang-menu-item locale="es" :name="'Spanish' | i18n" @clicked="selectLanguage"/>
      <lang-menu-item locale="it" :name="'Italian' | i18n" @clicked="selectLanguage"/>
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
