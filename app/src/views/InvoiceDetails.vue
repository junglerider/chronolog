<template>
  <v-form ref="form" v-if="user.hasRole('invoicing')">
    <v-container>
      <v-row>
        <v-col cols="12" md="12">
          <div class="page-title">{{ $i18n('Invoice Details') }}</div>
          <span>{{ $i18n('ID') }}: {{ invoice.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="3" class="form-col">
            <date-input :label="$i18n('Date')" v-model="invoice.date" :rules="requiredRule"></date-input>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <v-autocomplete
            :label="$i18n('Customer')"
            :items="customers"
            v-model="invoice.customer_id"
            item-value="id"
            item-title="name"
            :rules="requiredRule"
            @update:model-value="onCustomerChange"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <v-text-field :label="$i18n('Invoice no.')" v-model="invoice.invoice_no" :rules="requiredRule"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <v-select :label="$i18n('Status')" :items="statusValues" v-model="invoice.status" :rules="requiredRule"></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <v-row>
            <v-col cols="12" class="form-col">
              <date-input :label="$i18n('Due date')" v-model="invoice.due_date" :rules="requiredRule" :hint="dateDifference"></date-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="form-col">
              <v-combobox :label="$i18n('Currency')" :items="currencies" v-model="invoice.currency" :rules="requiredRule"></v-combobox>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
            <v-textarea :label="$i18n('Address')" :rules="requiredRule" v-model="invoice.address" auto-grow rows="1"></v-textarea>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="form-col">
          <v-row>
            <v-col cols="12" sm="6" md="6" class="form-col">
              <v-text-field :label="$i18n('Payment terms')" v-model="invoice.payment_terms"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="6" class="form-col">
              <v-text-field :label="$i18n('Issued by')" v-model="invoice.issuer"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6" md="6" class="form-col">
              <v-text-field :label="$i18n('Created at')" v-model="createdAt" readonly tabindex="-1"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="6" class="form-col">
              <v-text-field :label="$i18n('Updated at')" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
        <div style="display: flex; margin-bottom: 16px">
          <div style="margin-left: -10px; margin-right: 5px;">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn icon v-bind="props" @click="addItem()" style="padding-bottom: 4px" variant="text">
                  <v-icon>mdi-plus-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>{{ $i18n('Add') }}</span>
            </v-tooltip>
          </div>
          <div class="page-title">{{ $i18n('Invoice items') }}</div>
        </div>
        <v-row align="end">
          <v-col cols="12" sm="6" md="6" class="form-col">
            <v-textarea :label="$i18n('Headline')" v-model="invoice.headline" auto-grow rows="1"></v-textarea>
          </v-col>
          <v-col cols="12" sm="6" md="6" class="form-col">
          </v-col>
        </v-row>
        <v-row v-for="item in items" :key="item.id" align="end">
          <v-col style="display: flex" cols="12" sm="6" md="6" class="form-col">
            <div style="margin-left: -10px; margin-right: 5px; padding-top: 10px;">
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" @click="removeItem(item.id)" variant="text">
                    <v-icon>mdi-minus-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $i18n('Delete') }}</span>
              </v-tooltip>
            </div>
            <div style="flex: 80%">
              <v-textarea :label="$i18n('Description')" v-model="item.description" :rules="requiredRule" auto-grow rows="1"></v-textarea>
            </div>
          </v-col>
          <v-col cols="12" sm="6" md="3" class="form-col">
            <v-row>
              <v-col cols="6" class="sm-6 md-6 form-col">
                <v-text-field
                  :label="$i18n('Quantity')"
                  v-model="item.quantity"
                  type="number"
                  @change="recalc"
                  :rules="requiredRule"
              ></v-text-field>
              </v-col>
              <v-col cols="6" class="sm-6 md-6 form-col">
                <currency-input
                  :label="$i18n('Unit price')"
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
          <v-col cols="12" sm="6" md="3" class="form-col">
            <currency-input
              :label="$i18n('Amount')"
              :model-value="calcAmount(item)"
              :currency="invoice.currency"
              :locale="$getLanguage()"
              readonly
              tabindex="-1"
            ></currency-input>
          </v-col>
        </v-row>
      <v-row style="margin-top: 30px">
        <v-col cols="12" sm="6" md="6" class="form-col">
          <div class="page-title">{{ $i18n('Total') }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <v-row>
            <v-col cols="6" class="form-col">
              <v-text-field
                :label="$i18n('Total quantity')"
                :model-value="totalQuantity"
                readonly tabindex="-1"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <currency-input
            :label="$i18n('Net total')"
            v-model="invoice.net_total"
            readonly tabindex="-1"
            :currency="invoice.currency"
            :locale="$getLanguage()"
          ></currency-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="3" class="form-col">
        </v-col>
        <v-col style="display: flex;" cols="12" sm="6" md="3" class="form-col">
          <div style="flex: 0 0 auto; margin-right: 15px; white-space: nowrap">
            <v-checkbox
              :label="$i18n('Sales tax')"
              v-model="invoice.show_tax"
              :true-value="1" :false-value="0"
              @change="onTaxChange"
            ></v-checkbox>
          </div>
          <div style="flex: 1 1 0; min-width: 0">
            <v-text-field
              :label="$i18n('Sales tax rate')"
              v-model="invoice.tax_rate"
              prefix="%" reverse
              :disabled="invoice.show_tax == 0"
              type="number"
              @change="onTaxChange"
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <currency-input
          :label="$i18n('Sales tax amount')"
          v-model="invoice.tax_amount"
          :currency="invoice.currency"
          :locale="$getLanguage()"
          readonly tabindex="-1"
          :disabled="invoice.show_tax == 0"
        ></currency-input>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="form-col">
          <currency-input
          :label="$i18n('Grand total')"
          v-model="invoice.grand_total"
          :currency="invoice.currency"
          :locale="$getLanguage()"
          readonly tabindex="-1"
        ></currency-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="12" class="form-col text-right">
          <v-btn class="ml-2 mt-4" color="primary" :disabled="isSaving" @click="onSave">{{ $i18n('Save') }}</v-btn>
          <v-btn class="ml-2 mt-4" @click="$router.push('/invoices')">{{ $i18n('Cancel') }}</v-btn>
          <v-btn class="ml-2 mt-4" v-if="invoice.id !== 'new'" @click="onPrint">{{ $i18n('Print') }}</v-btn>
          <v-btn class="ml-2 mt-4" v-if="invoice.id !== 'new'" @click="onDuplicate">{{ $i18n('Duplicate') }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" location="top" variant="tonal">
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
        { value: 'draft', title: this.$i18n('draft') },
        { value: 'sent', title: this.$i18n('sent') },
        { value: 'paid', title: this.$i18n('paid') },
        { value: 'overdue', title: this.$i18n('overdue') },
        { value: 'voided', title: this.$i18n('voided') },
      ],
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      requiredRule: [ (v) => Boolean(v) || this.$i18n('Required') ],
    }
  },

  computed: {
    totalQuantity() {
      const sum = this.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
      return Math.round(sum * 1e6) / 1e6
    },
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
      this.invoice.address = address
    },
    onPrint() {
      window.open(`/reports/invoice/${this.invoice.id}`, '_blank')
    },
    onDuplicate() {
      this.$router.push(`/invoices/new?duplicate=${this.invoice.id}`)
      this.$router.go()
    },
    async onSave() {
      let isDataWritten = false
      if (!(await this.$refs.form.validate()).valid) {
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
    } else if (this.$route.query.duplicate) {
      try {
        const id = this.$route.query.duplicate
        let response = await api.get(`/invoice/${id}`)
        this.invoice = response.data
        this.invoice.id = 'new'
        response = await api.get(`/invoice/${id}/items`)
        this.items = response.data.map(item => {
          if (item) {
            item.id = _.uniqueId('new'),
            item.invoice_id = 'new'
          }
          return item
        })
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