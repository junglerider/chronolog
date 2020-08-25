<template>
  <data-list
    :title="'Contacts' | i18n"
    :headers="headers"
    apiBaseUrl="/person"
    uiBaseUrl="/contacts"
    :searchFilter="'&filter[first_name][like]={search}%&filter[last_name][like]={search}%&combine=OR'"
  ></data-list>
</template>

<script>
  import DataList from '../components/DataList'

  export default {
    components: {
      DataList
    },
    data() {
      return {
        headers: [
          { text: this.$i18n('ID'), value: 'id', align: 'start' },
          { text: this.$i18n('Type'), value: 'type', sortable: false },
          { text: this.$i18n('Title'), value: 'title', sortable: false },
          { text: this.$i18n('First Name'), value: 'first_name' },
          { text: this.$i18n('Last Name'), value: 'last_name' },
          { text: this.$i18n('City'), value: 'city' },
          { text: this.$i18n('Country'), value: 'country', sortable: false },
        ],
      }
    },
  }
</script>