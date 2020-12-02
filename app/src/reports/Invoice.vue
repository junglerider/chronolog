<template>
  <div id="invoice" v-if="user.hasRole('invoicing')">
    <div id="page">
      <!-- invoice header: logo/address -->
      <div id="header" v-html="settings.get('inv:header')"></div>
      <div id="title">{{ 'Invoice' | i18n }}</div>
      <table id="invoicedata">
        <!-- invoice head data -->
        <tbody>
          <tr>
            <td style="width: 10%; padding-right: 10px;">
              <b>{{'Cust. no.' | i18n }}:</b>
            </td>
            <td style="width: 30%; padding-right: 10px;">{{ organisationNo }}</td>
            <td style="width: 10%;">
              <br/>
            </td>
            <td style="width: 20%; padding-right: 10px;">
              <b>{{ 'Invoice no.' | i18n }}:</b>
            </td>
            <td style="width: 20%;">{{ invoice.invoice_no }}</td>
          </tr>
          <tr>
            <td>
              <b>{{ 'Customer' | i18n }}:</b>
            </td>
            <td rowspan="3">
              <text-block :value="invoice.address"></text-block>
            </td>
            <td><br/></td>
            <td>
              <b>{{ 'Date' | i18n }}:</b>
            </td>
            <td>{{ invoice.date | i18nDate }}</td>
          </tr>
          <tr>
            <td><br/></td>
            <td><br/></td>
            <td>
              <b>{{ 'Due date' | i18n }}:</b>
            </td>
            <td>{{ invoice.due_date | i18nDate }}</td>
          </tr>
          <tr>
            <td><br/></td>
            <td><br/></td>
            <td>
              <b>{{ 'Issued by' | i18n }}:</b>
            </td>
            <td>{{ invoice.issuer }}</td>
          </tr>
        </tbody>
      </table>
      <table id="itemdata">
        <!-- items column names -->
        <tbody>
          <tr style="border-bottom: 1px solid rgb(0, 0, 0);">
            <td style="width: 5%; padding-bottom: 8px;">
              <b>{{ 'No.' | i18n }}</b>
            </td>
            <td style="width: 45%; padding-bottom: 8px;">
              <b>{{ 'Description' | i18n }}</b>
            </td>
            <td style="width: 10%; padding-bottom: 8px; text-align: right;">
              <b>{{ 'Quantity' | i18n }}</b>
            </td>
            <td style="width: 15%; padding-bottom: 8px; text-align: right;">
              <b>{{ 'Unit price' | i18n }}</b>
            </td>
            <td style="width: 20%; padding-bottom: 8px; text-align: right;">
              <b>{{ 'Amount'  | i18n }}</b>
            </td>
          </tr>
          <!-- invoice items -->
          <tr v-if="invoice.headline">
            <td class="item"></td>
            <td class="item">
              <text-block :value="invoice.headline"></text-block>
            </td>
            <td class="item-right"></td>
            <td class="item-right"></td>
            <td class="item-right"></td>
          </tr>
          <tr v-for="(item, index) in items" :key="item.id">
            <td style="padding-top: 10px;">{{ String(index + 1).padStart(2, '0') }}</td>
            <td style="padding-top: 10px;">
              <text-block :value="item.description"></text-block>
            </td>
            <td class="item-right">
              {{ item.quantity }}
            </td>
            <td class="item-right">
              {{ formatAmount(item.unit_price) }}
            </td>
            <td class="item-right">
              {{ formatAmount(calcAmount(item)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- invoice footer: total + taxes -->
    <table id="invoicefooter">
      <tbody>
        <tr style="border-top: 1px solid rgb(0, 0, 0);">
          <td style="width: 60%; padding-top: 8px;">
            <b>{{ 'Payment terms' | i18n }}:</b> {{ invoice.payment_terms }}
          </td>
          <td style="width: 15%; padding-top: 8px; text-align: right;">
            <b>{{ 'Subtotal' | i18n }}</b>
          </td>
          <td style="width: 20%; padding-top: 8px; text-align: right;">{{ formatAmount(invoice.net_total) }}</td>
        </tr>
        <tr>
          <td>{{ 'All prices in' | i18n }} {{ invoice.currency }}</td>
          <td><br/></td>
          <td><br/></td>
        </tr>
        <tr>
          <td><br/></td>
          <td style="text-align: right;">
            <b>{{ 'Net total' | i18n }}</b>
          </td>
          <td style="text-align: right;">{{ formatAmount(invoice.net_total) }}</td>
        </tr>
        <tr>
          <td><br/></td>
          <td style="text-align: right;">
            <b v-if="invoice.show_tax">{{ 'Sales tax' | i18n }} {{ invoice.tax_rate }}%</b>
          </td>
          <td v-if="invoice.show_tax" style="text-align: right;">{{ formatAmount(invoice.tax_amount) }}</td>
        </tr>
        <tr>
          <td><br/></td>
          <td style="text-align: right;">
            <b>{{ 'Grand total' | i18n }}</b>
          </td>
          <td style="text-align: right;">
            <b>{{ formatAmount(invoice.grand_total) }}</b>
          </td>
        </tr>
        <tr>
          <td style>
            <div style="border-top: 1px solid rgb(0, 0, 0); text-align: center;">
              {{ 'Authorised signature' | i18n }}
            </div>
          </td>
          <td><br/></td>
          <td><br/></td>
        </tr>
      </tbody>
    </table>
    <div id="written-amount-bar">
      <b>{{ writtenAmount }}</b>
    </div>
    <div style="margin-top: 20px;" v-html="settings.get('inv:footer')"></div>
  </div>
</template>

<style scoped>
div#invoice, td, p {
  font-family: Arial, Sans Serif;
  font-size: 14px;
  color: #000;
  background-color: #fff;
  margin: 0px;
  padding: 0px;
}

div#invoice {
  margin: 20px;
}

#page {
  min-height: 650px;
}

#invoicedata {
 border: 0px none;
 border-collapse: collapse;
 width: 100%;
}

#invoicedata td {
  padding: 0px 0px 6px 0px;
  margin: 0px;
  vertical-align: top;
}

#header {
  border-bottom: 1px solid rgb(0, 0, 0);
  padding-bottom: 20px;
  display: flex;
  width: 100%;
}

#title {
  margin: 10px 0px;
  font-size: 1.8em;
}

#itemdata {
  border: 0px none;
  margin-top: 30px;
  border-collapse: collapse;
  width: 100%;
}

#itemdata td {
  padding: 0px 0px 6px 0px;
  margin: 0px;
  vertical-align: top;
}

.item {
  padding-top: 10px !important;
}

.item-right {
  padding-top: 10px !important;
  text-align: right;
}

#invoicefooter {
  border: 0px none;
  border-collapse: collapse;
  width: 100%;
}

#invoicefooter td {
  padding: 0px 0px 6px 0px;
  margin: 0px;
  vertical-align: top;
}

#written-amount-bar {
  padding: 8px 0px;
  width: 100%;
  background-color: rgb(221, 221, 221);
  text-align: center;
  margin-top: 20px;
}
</style>

<script>
import api from '../services/api'
import NumberFormat from '../services/NumberFormat'
import TextBlock from '../components/TextBlock'
import n2words  from 'n2words'

export default {

  components: {
    TextBlock,
  },

  data() {
    return {
      user: api.user,
      invoice: {},
      items: [],
      formatter: new NumberFormat(this.$getLanguage()),
      settings: new Map(),
    }
  },

  methods: {
    formatAmount(num) {
      return this.formatter.formatAmount(num)
    },
    calcAmount(item) {
      return item.unit_price && item.quantity ? item.unit_price * item.quantity : 0
    },
  },

  computed: {
    organisationNo() {
      const orgNum = String(this.invoice.organisation_id).padStart(6, '0')
      return orgNum.slice(0, 3) + '-' + orgNum.slice(3)
    },
    writtenAmount() {
      const options = {lang: this.$getLanguage()}
      const amount = Math.floor(this.invoice.grand_total)
      const hundredth = Math.floor((this.invoice.grand_total - amount) * 100)
      let writtenAmount = n2words(amount, options)
      if (hundredth > 0) {
        writtenAmount += ' / ' + n2words(hundredth, options)
      }
      return writtenAmount
    }
  },

  async mounted() {
    try {
      const id = this.$route.params.id
      let response = await api.get(`/invoice/${id}`)
      this.invoice = response.data
      response = await api.get(`/invoice/${id}/items`)
      this.items = response.data
      this.formatter = new NumberFormat(this.$getLanguage(), this.invoice.currency)
      response = await api.get('/settings/inv')
      this.settings = new Map(response.data.map(entry => [entry.key, entry.value]))
    } catch(e) {
      console.error(e)
    }
  }
}
</script>