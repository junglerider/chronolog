<template>
  <v-form ref="form" v-if="user.hasRole('invoicing')">
    <v-container>
      <v-row>
        <v-col class="col-12 col-md-12">
          <div class="page-title">{{ 'Invoice Details' | i18n }}</div>
          <span>{{ 'ID' | i18n }}: {{ invoice.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <date-input :label="'Date' | i18n" v-model="invoice.date" :rules="requiredRule"></date-input>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-autocomplete
            :label="'Customer' | i18n"
            :items="customers"
            v-model="invoice.customer_id"
            item-value="id"
            item-text="name"
            :rules="requiredRule"
            @change="onCustomerChange"
          ></v-autocomplete>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-text-field :label="'Invoice no.' | i18n" v-model="invoice.invoice_no" :rules="requiredRule"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-select :label="'Status' | i18n" :items="statusValues" v-model="invoice.status" :rules="requiredRule"></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-row>
            <v-col class="col-12 form-col">
              <date-input :label="'Due date' | i18n" v-model="invoice.due_date" :rules="requiredRule" :hint="dateDifference"></date-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="col-12 form-col">
              <v-combobox :label="'Currency' | i18n" :items="currencies" v-model="invoice.currency" :rules="requiredRule"></v-combobox>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <v-textarea :label="'Address' | i18n" :rules="requiredRule" v-model="invoice.address" auto-grow rows="1"></v-textarea>
        </v-col>
        <v-col class="col-12 col-sm-12 col-md-6 form-col">
          <v-row>
            <v-col class="col-12 col-sm-6 col-md-6 form-col">
              <v-text-field :label="'Payment terms' | i18n" v-model="invoice.payment_terms"></v-text-field>
            </v-col>
            <v-col class="col-12 col-sm-6 col-md-6 form-col">
              <v-text-field :label="'Issued by' | i18n" v-model="invoice.issuer"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="col-12 col-sm-6 col-md-6 form-col">
              <v-text-field :label="'Created at' | i18n" v-model="createdAt" readonly tabindex="-1"></v-text-field>
            </v-col>
            <v-col class="col-12 col-sm-6 col-md-6 form-col">
              <v-text-field :label="'Updated at' | i18n" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
        <div style="display: flex; margin-bottom: 16px">
          <div style="margin-left: -10px; margin-right: 5px">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="addItem()">
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>{{ 'Add' | i18n }}</span>
            </v-tooltip>
          </div>
          <div class="page-title">{{ 'Invoice items' | i18n }}</div>
        </div>
        <v-row align="end">
          <v-col class="col-12 col-sm-6 col-md-6 form-col">
            <v-textarea :label="'Headline' | i18n" v-model="invoice.headline" auto-grow rows="1"></v-textarea>
          </v-col>
          <v-col class="col-12 col-sm-6 col-md-6 form-col">
          </v-col>
        </v-row>
        <v-row v-for="item in items" :key="item.id" align="end">
          <v-col class="col-12 col-sm-6 col-md-6 form-col" style="display: flex">
            <div style="margin-left: -10px; margin-right: 5px; padding-top: 10px;">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on" @click="removeItem(item.id)">
                    <v-icon>mdi-minus-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ 'Delete' | i18n }}</span>
              </v-tooltip>
            </div>
            <div style="flex: 80%">
              <v-textarea :label="'Description' | i18n" v-model="item.description" :rules="requiredRule" auto-grow rows="1"></v-textarea>
            </div>
          </v-col>
          <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <v-row>
              <v-col class="col-6 sm-6 md-6 form-col">
                <v-text-field
                  :label="'Quantity' | i18n"
                  v-model="item.quantity"
                  type="number"
                  @change="recalc"
                  :rules="requiredRule"
              ></v-text-field>
              </v-col>
              <v-col class="col-6 sm-6 md-6 form-col">
                <currency-input
                  :label="'Unit price' | i18n"
                  v-model="item.unit_price"
                  @change="recalc"
                  :rules="requiredRule"
                  :currency="invoice.currency"
                  :locale="$getLanguage()"
                  type='cu'
                ></currency-input>
              </v-col>
            </v-row>
          </v-col>
          <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <currency-input
              :label="'Amount' | i18n"
              :value="calcAmount(item)"
              :currency="invoice.currency"
              :locale="$getLanguage()"
              readonly
              tabindex="-1"
            ></currency-input>
          </v-col>
        </v-row>
      <v-row style="margin-top: 30px">
        <v-col class="col-12 col-sm-6 col-md-9 form-col">
          <div class="page-title">{{ 'Total' | i18n }}</div>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <currency-input
            :label="'Net total' | i18n"
            v-model="invoice.net_total"
            readonly tabindex="-1"
            :currency="invoice.currency"
            :locale="$getLanguage()"
          ></currency-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col" style="display: flex;">
          <div style="max-width: 180px; margin-right: 15px">
            <v-checkbox
              :label="'Sales tax' | i18n"
              v-model="invoice.show_tax"
              :true-value="1" :false-value="0"
              @change="onTaxChange"
            ></v-checkbox>
          </div>
          <div style="flex: 80%;">
            <v-text-field
              :label="'Sales tax rate' | i18n"
              v-model="invoice.tax_rate"
              prefix="%" reverse
              :disabled="invoice.show_tax == 0"
              type="number"
              @change="onTaxChange"
            ></v-text-field>
          </div>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <currency-input
          :label="'Sales tax amount' | i18n"
          v-model="invoice.tax_amount"
          :currency="invoice.currency"
          :locale="$getLanguage()"
          readonly tabindex="-1"
          :disabled="invoice.show_tax == 0"
        ></currency-input>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <currency-input
          :label="'Grand total' | i18n"
          v-model="invoice.grand_total"
          :currency="invoice.currency"
          :locale="$getLanguage()"
          readonly tabindex="-1"
        ></currency-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col" align="right">
          <v-btn class="ml-2 mt-4" color="primary" :disabled="isSaving" @click="onSave">{{ 'Save' | i18n }}</v-btn>
          <v-btn class="ml-2 mt-4" @click="$router.back()">{{ 'Cancel' | i18n }}</v-btn>
          <v-btn class="ml-2 mt-4" v-if="invoice.id !== 'new'" @click="onPrint">{{ 'Print' | i18n }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
      <v-icon v-if="messageColor == 'info'" color="blue">mdi-alert-outline</v-icon>
      {{ messageText }}
    </v-snackbar>
  </v-form>
</template>

<script>
import _ from 'lodash'
import api from '../services/api'
import DateInput from '../components/DateInput'
import DateCalc from '../services/DateCalc'
import CurrencyInput from '../components/CurrencyInput'

export default {
  components: {
    DateInput,
    CurrencyInput,
  },

  data() {
    return {
      user: api.user,
      invoice: { id: 'new', net_total: 0, tax_rate: 0, show_tax: 1 },
      previousInvoice: null,
      items: [],
      previousItems: null,
      deleteList: [],
      customers: [],
      currencies: ['EUR', 'USD', 'GBP', 'CHF', 'CNY', 'JPY'],
      statusValues: [
        { value: 'draft', text: this.$i18n('draft') },
        { value: 'sent', text: this.$i18n('sent') },
        { value: 'paid', text: this.$i18n('paid') },
        { value: 'overdue', text: this.$i18n('overdue') },
        { value: 'voided', text: this.$i18n('voided') },
      ],
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      requiredRule: [ (v) => Boolean(v) || this.$i18n('Required') ],
    }
  },

  computed: {
    updatedAt() {
      return this.invoice.updated_at ? this.$i18nDate(this.invoice.updated_at) : null
    },
    createdAt() {
      return this.invoice.created_at ? this.$i18nDate(this.invoice.created_at) : null
    },
    dateDifference() {
      if (!this.invoice.date || !this.invoice.due_date) {
        return null
      }
      const diffTime = new Date(this.invoice.due_date) - new Date(this.invoice.date)
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
      return diffDays + ' ' + this.$i18n('days')
    }
  },

  methods: {
    async onCustomerChange() {
      const organisationId = this.customers.reduce(
        (id, cust) => cust.id === this.invoice.customer_id ? cust.organisation_id : id, undefined
      )
      const response = await api.get(`/organisation/${organisationId}`)
      const a = response.data
      a.postcode_city = a.postcode && a.city ? (a.postcode + ' ' + a.city) : a.postcode ? a.postcode : a.city
      const address = ['name', 'street_address', 'postcode_city', 'state_province', 'country'].
        filter(line => Boolean(a[line])).
        map(line => a[line]).
        join('\n')
      this.$set(this.invoice, 'address', address)
    },
    onPrint() {
      window.open(`/reports/invoice/${this.invoice.id}`, '_blank')
    },
    async onSave() {
      let isDataWritten = false
      if (!this.$refs.form.validate()) {
        return
      }
      this.isSaving = true
      if (!_.isEqual(this.invoice, this.previousInvoice)) {
        try {
          if (this.invoice.id === 'new') {
            this.invoice.created_at = DateCalc.isoDateTime()
            const response = await api.post(`/invoice`, api.nullIt(this.invoice))
            if (response.status === 201) {
              this.invoice.id = response.data.id
            }
          } else {
            this.invoice.updated_at = DateCalc.isoDateTime()
            await api.put(`/invoice/${this.invoice.id}`, api.nullIt(this.invoice))
          }
          isDataWritten = true
          this.previousInvoice = _.clone(this.invoice)
        } catch (err) {
          console.error(err)
          const msg = err.response.status == 409 ? 'Invoice number already exists.' : 'Saving did not succeed.'
          this.showMessage(msg, 'error')
          this.isSaving = false
          return
        }
      }
      try {
        let itemsWritten = await this.saveItems(this.invoice.id)
        isDataWritten = isDataWritten || Boolean(itemsWritten)
      } catch(err) {
          console.error(err)
          this.showMessage('Saving did not succeed.', 'error')
          this.isSaving = false
          return
      }
      if (isDataWritten) {
        this.showMessage('OK - Saved!')
      } else {
        this.showMessage('No changes were made.', 'info')
      }
      this.isSaving = false
    },
    async saveItems(invoice_id) {
      let recordsWritten = 0
      for (let item of this.items) {
        if (typeof item.id === 'string' && item.id.startsWith('new')) {
          item.invoice_id = invoice_id
          const response = await api.post('/invoice-item', api.nullIt(item))
          if (response.status === 201) {
            item.id = response.data.id
            recordsWritten++
          }
        } else if (!this.isInList(this.previousItems, item)) {
          await api.put(`/invoice-item/${item.id}`, api.nullIt(item))
          recordsWritten++
        }
      }
      for (let id of this.deleteList) {
        await api.delete(`/invoice-item/${id}`)
        recordsWritten++
      }
      this.deleteList = []
      this.previousItems = _.cloneDeep(this.items)
      return recordsWritten
    },
    isInList(list, item) {
      for (let listItem of list) {
        if (_.isEqual(listItem, item)) {
          return true
        }
      }
      return false
    },
    addItem() {
      this.items.push({
        id: _.uniqueId('new'),
        invoice_id: this.invoice.id,
        item_no: this.items.length + 1
      })
    },
    removeItem(id) {
      if (typeof id !== 'string' || !id.startsWith('new')) {
        this.deleteList.push(id)
      }
      this.items = this.items.filter(item => item.id !== id)
      this.recalc()
    },
    calcAmount(item) {
      return item.unit_price && item.quantity ? item.unit_price * item.quantity : 0
    },
    recalc() {
      this.invoice.net_total = this.items.reduce(
        (acc, item) => acc + (item.unit_price && item.quantity ? item.unit_price * item.quantity : 0), 0
      )
      this.onTaxChange()
    },
    onTaxChange() {
      this.invoice.tax_amount = this.invoice.tax_rate * this.invoice.net_total / 100
      this.invoice.grand_total = this.invoice.show_tax === 1 ?
        this.invoice.net_total + this.invoice.tax_amount :
        this.invoice.net_total
    },
    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },
  },

  async mounted() {
    if (this.$route.params.id !== 'new') {
      try {
        const id = this.$route.params.id
        let response = await api.get(`/invoice/${id}`)
        this.invoice = response.data
        this.previousInvoice = _.clone(this.invoice)
        response = await api.get(`/invoice/${id}/items`)
        this.items = response.data
        this.previousItems = _.cloneDeep(this.items)
      } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
      }
    }
    const response = await api.get(`/customer?order=name`)
    this.customers = response.data.map(customer => { return {
      id: customer.id, name: customer.name, organisation_id: customer.organisation_id
    }})
  },

}
</script>