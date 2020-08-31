<template>
  <v-form ref="form">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'Customer Details' | i18n }}</div>
          <span>{{ 'ID' | i18n }}: {{ customer.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Name' | i18n" v-model="customer.name" :rules="requiredRule"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            :label="'Organisation' | i18n"
            :items="organisations"
            v-model="customer.organisation_id"
            item-value="id"
            item-text="name"
            :rules="requiredRule"
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col" style="display: flex;">
          <div style="flex: 80%;">
            <v-textarea :label="'Notes' | i18n" v-model="customer.notes" auto-grow rows="1"></v-textarea>
          </div>
          <div style="max-width: 180px; margin-left: auto; text-align: right">
            <v-checkbox :label="'Is Retired' | i18n" class="mx-2" v-model="customer.is_retired" :true-value="1" :false-value="0"></v-checkbox>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="customer.id !== 'new'">
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Created at' | i18n" v-model="createdAt" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Updated at' | i18n" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row v-if="customer.id !== 'new'">
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Number of tasks' | i18n" v-model="customer.task_count" readonly tabindex="-1"></v-text-field>
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
import api, {nullIt} from '../services/api'
import DateCalc from '../services/DateCalc'

export default {

  data() {
    return {
      customer: { id: 'new' },
      previousCustomer: { id: 'new' },
      organisations: [],
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      requiredRule: [ (v) => Boolean(v) || this.$i18n('Required') ]
    }
  },

  computed: {

    updatedAt() {
      if (!this.customer.updated_at) {
        return null
      }
      return this.$i18nDate(this.customer.updated_at)
    },

    createdAt() {
      if (!this.customer.created_at) {
        return null
      }
      return this.$i18nDate(this.customer.created_at)
    }
  },

  methods: {

    async onSave() {
      if (!this.$refs.form.validate()) {
        return
      }
      if (!_.isEqual(this.customer, this.previousCustomer)) {
        this.isSaving = true
        try {
          if (this.customer.id == 'new') {
            this.customer.created_at = DateCalc.isoDateTime()
            const response = await api.post('/customer', nullIt(this.customer))
            if (response.status === 201) {
              this.customer.id = response.data.id
            }
          } else {
            this.customer.updated_at = DateCalc.isoDateTime()
            await api.put(`/customer/${this.customer.id}`, nullIt(this.customer))
          }
          this.showMessage('OK - Saved!')
          this.previouscustomer = _.cloneDeep(this.customer)
        } catch (e) {
          console.error(e)
          this.showMessage('Saving did not succeed.', 'error')
        }
        this.isSaving = false
      } else {
        this.showMessage('No changes were made.', 'info')
      }
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
        let response = await api.get(`/customer/${this.$route.params.id}`)
        this.customer = response.data
        response = await api.get(`/customer/task-count?filter[id][eq]=${this.$route.params.id}`)
        this.customer.task_count = response.data[0].task_count
        this.previousCustomer = _.clone(this.customer)
      } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
      }
    }
    const response = await api.get(`/organisation?order=name`)
    this.organisations = response.data.map(org => { return {id: org.id, name: org.name} })
  },

}
</script>