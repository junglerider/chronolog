<template>
  <data-list
    v-if="user.hasRole('contacts')"
    :title="'Organisations' | i18n"
    :headers="headers"
    apiBaseUrl="/organisation"
    uiBaseUrl="/organisations"
    :searchFilter="'&filter[name][like]={search}%'"
  ></data-list>
</template>

<script>
  import DataList from '../components/DataList'
  import api from '../services/api'

  export default {

    components: {
      DataList
    },

    data() {
      return {
        user: api.user,
        headers: [
          { text: this.$i18n('ID'), value: 'id', align: 'start' },
          { text: this.$i18n('Type'), value: 'type', sortable: false },
          { text: this.$i18n('Name'), value: 'name' },
          { text: this.$i18n('Industry'), value: 'industry' },
          { text: this.$i18n('City'), value: 'city' },
          { text: this.$i18n('Country'), value: 'country', sortable: false },
        ],
      }
    },
  }
</script>