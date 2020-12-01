<template>
  <div>
    <data-list
      v-if="user.hasRole('invoicing')"
      :title="'Invoices' | i18n"
      :headers="headers"
      apiBaseUrl="/invoice"
      uiBaseUrl="/invoices"
      :searchFilter="'&filter[invoice_no][like]={search}%'"
      :afterGetData="afterGetData"
      :onDeleteData="onDelete"
      settings="inv:header,inv:footer"
    ></data-list>
  </div>
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
          { text: this.$i18n('Invoice no.'), value: 'invoice_no' },
          { text: this.$i18n('Date'), value: 'date' },
          { text: this.$i18n('Customer'), value: 'customer_name', sortable: false },
          { text: this.$i18n('Status'), value: 'status', sortable: false },
          { text: this.$i18n('Amount'), value: 'amount', sortable: false, align: 'end' },
        ],
      }
    },

    methods: {
      afterGetData(data) {
        return data.map(record => {
          let amount = record.grand_total.toFixed(2) + ' ' + record.currency
          try {
            amount = new Intl.NumberFormat(this.$getLanguage(), { style: 'currency', currency: record.currency }).format(record.grand_total)
          } catch (err) {
            console.error(err)
          }
          return {
            ...record,
            amount
          }
        })
      },

      onDelete(selected) {
        return selected.map(invoice => {
          return api.delete(`/invoice/${invoice.id}`)
        })
      }

    }
  }
</script>