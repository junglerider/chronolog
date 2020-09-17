<template>
  <v-form ref="form">
    <v-container>
      <v-row>
        <v-col md="12">
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
              <date-input :label="'Due date' | i18n" v-model="invoice.due_date" :rules="requiredRule"></date-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="col-12 form-col">
              <v-combobox :label="'Currency' | i18n" :items="currencies" v-model="invoice.currency" :rules="requiredRule"></v-combobox>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <v-textarea :label="'Address' | i18n" v-model="invoice.address" auto-grow rows="1"></v-textarea>
        </v-col>
        <v-col class="col-12 col-sm-12 col-md-6 form-col">
          <v-row>
            <v-col class="col-12 col-sm-6 col-md-6 form-col">
              <v-text-field :label="'Payment terms' | i18n" v-model="invoice.payment_terms"></v-text-field>
            </v-col>
            <v-col class="col-12 col-sm-6 col-md-6 form-col">
              <v-text-field :label="'Issuer' | i18n" v-model="invoice.issuer"></v-text-field>
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
      <div v-if="invoice.id !== 'new'">
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
        <v-row v-for="item in items" :key="item.id" align="end">
          <v-col class="col-12 col-sm-6 col-md-6 form-col" style="display: flex">
            <div style="margin-left: -10px; margin-right: 5px; padding-top: 10px;">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on" @click="removeItem(item)">
                    <v-icon>mdi-minus-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ 'Delete' | i18n }}</span>
              </v-tooltip>
            </div>
            <div style="flex: 80%">
              <v-textarea :label="'Description' | i18n" v-model="item.description" auto-grow rows="1"></v-textarea>
            </div>
          </v-col>
          <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <v-row>
              <v-col class="col-6 sm-6 md-6 form-col">
                <v-text-field :label="'Quantity' | i18n" v-model="item.quantity" type="number" @change="recalc"></v-text-field>
              </v-col>
              <v-col class="col-6 sm-6 md-6 form-col">
                <v-text-field :label="'Unit price' | i18n" v-model="item.unit_price" :suffix="invoice.currency" @change="recalc"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col class="col-12 col-sm-6 col-md-3 form-col">
            <v-text-field :label="'Amount' | i18n" :value="calcAmount(item)" readonly tabindex="-1" :suffix="invoice.currency"></v-text-field>
          </v-col>
        </v-row>
      </div>
      <v-row style="margin-top: 30px">
        <v-col class="col-12 col-sm-6 col-md-9 form-col">
          <div class="page-title">{{ 'Total' | i18n }}</div>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-text-field :label="'Net total' | i18n" v-model="invoice.net_total" readonly tabindex="-1" :suffix="invoice.currency"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col" style="display: flex;">
          <div style="max-width: 180px; margin-right: 15px">
            <v-checkbox
              :label="'Tax' | i18n"
              v-model="invoice.show_tax"
              :true-value="1" :false-value="0"
              @change="onTaxChange"
            ></v-checkbox>
          </div>
          <div style="flex: 80%;">
            <v-text-field
              :label="'Tax rate' | i18n"
              v-model="invoice.tax_rate"
              prefix="%" reverse
              :disabled="invoice.show_tax == 0"
              type="number"
              @change="onTaxChange"
            ></v-text-field>
          </div>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-text-field :label="'Tax amount' | i18n" v-model="invoice.tax_amount" readonly tabindex="-1" :suffix="invoice.currency" :disabled="invoice.show_tax == 0"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-3 form-col">
          <v-text-field :label="'Grand total' | i18n" v-model="invoice.grand_total" readonly tabindex="-1" :suffix="invoice.currency"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col" align="right">
          <v-btn class="mt-4" color="primary" :disabled="isSaving" @click="onSave">{{ 'Save' | i18n }}</v-btn>
          <v-btn class="ml-2 mt-4" @click="$router.back()">{{ 'Cancel' | i18n }}</v-btn>
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

export default {
  components: {
    DateInput,
  },

  data() {
    return {
      invoice: { id: 'new' },
      previousInvoice: null,
      items: [],
      customers: [],
      currencies: ['EUR', 'USD', 'GBP', 'CHF', 'CAD'],
      statusValues: ['draft', 'sent', 'paid', 'overdue', 'voided'],
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
  },

  methods: {
    async onSave() {
      if (!this.$refs.form.validate()) {
        return
      }
    },
    addItem() {
      console.log('adding invoice item')
    },
    removeItem() {
      console.log('removing invoice item')
    },
    calcAmount(item) {
      return item.unit_price * item.quantity
    },
    recalc() {
      console.log('recalc')
      this.invoice.net_total = this.items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
      this.onTaxChange()
    },
    onTaxChange() {
      console.log('onTaxChange')
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
        console.log(this.items)
      } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
      }
    }
    const response = await api.get(`/customer?order=name`)
    this.customers = response.data.map(customer => { return {
      id: customer.id, name: customer.name
    }})
  },

}
</script>