<template>
  <v-form ref="form">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'Organisation Details' | i18n }}</div>
          <span>{{ 'ID' | i18n }}: {{ organisation.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Name' | i18n" :rules="requiredRule" v-model="organisation.name"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-select :label="'Type' | i18n" :items="types" clearable v-model="organisation.type"></v-select>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Industry' | i18n" v-model="organisation.industry"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-8 form-col">
          <v-textarea :label="'Street Address' | i18n" auto-grow rows="1" v-model="organisation.street_address"></v-textarea>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Postal Code' | i18n" v-model="organisation.postcode"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'City' | i18n" v-model="organisation.city"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'State/Province' | i18n" v-model="organisation.state_province"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-autocomplete :label="'Country' | i18n" :items="countries" v-model="organisation.country"></v-autocomplete>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <date-input :label="'First Contact' | i18n" v-model="organisation.first_contact"></date-input>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <date-input :label="'Last Contact' | i18n" v-model="organisation.last_contact"></date-input>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Updated at' | i18n" disabled v-model="updatedAt"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col">
          <v-textarea :label="'Notes' | i18n" auto-grow rows="1" v-model="organisation.comment"></v-textarea>
        </v-col>
      </v-row>
      <v-row v-if="organisation.id !== 'new'">
        <v-col class="col-12 col-sm-6 col-md-6 form-col">
          <phone-list :entityId="String(organisation.id)" ref="phoneList"/>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-6 form-col">
          <employee-list entityType="organisation" :entityId="String(organisation.id)" ref="employeeList"/>
        </v-col>
      </v-row>
      <v-row style="padding-top: 15px">
        <v-col class="col-12 col-md-12 form-col" align="end">
          <v-btn primary color="primary" :disabled="isSaving" @click="onSave">{{ 'Save' | i18n }}</v-btn>
          <v-btn class="ml-2" @click="$router.back()">{{ 'Cancel' | i18n }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
      {{ messageText }}
    </v-snackbar>
  </v-form>
</template>

<script>
import _ from 'lodash'
import DateInput from '../components/DateInput'
import PhoneList from '../components/PhoneList'
import EmployeeList from '../components/EmployeeList'
import api, { nullIt } from '../api'
import countries from '../i18n/countries.json'

export default {
  components: {
    DateInput,
    PhoneList,
    EmployeeList,
  },

  data() {
    return {
      organisation: { id: 'new' },
      previousOrganisation: { id: 'new' },
      types: [
        { value: 'CUS', text: this.$i18n('Customer') },
        { value: 'SUP', text: this.$i18n('Supplier') },
        { value: 'PRS', text: this.$i18n('Prospect') },
        { value: 'ASC', text: this.$i18n('Associate') },
        { value: 'GOV', text: this.$i18n('Government') },
        { value: 'NGO', text: this.$i18n('Non-Government') },
      ],
      countries: countries.map(country => country.name),
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      requiredRule: [ (v) => (Boolean(v) || 'Required') ],
    }
  },

  computed: {

    updatedAt() {
      if (!this.organisation.updated_at) {
        return null
      }
      return this.$i18nDate(this.organisation.updated_at)
    }
  },

  methods: {

    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },

    async onSave() {
      let isDataWritten = false
      if (!this.$refs.form.validate()) {
        return
      }
      this.isSaving = true
      if (!_.isEqual(this.organisation, this.previousOrganisation)) {
        try {
          const id = this.organisation.id
          this.organisation.updated_at = (new Date()).toISOString()
          if (id === 'new') {
            const response = await api.post(`organisation`, nullIt(this.organisation))
            if (response.status === 201) {
              this.organisation.id = response.data.id
            }
          } else {
            await api.put(`organisation/${id}`, nullIt(this.organisation))
          }
          isDataWritten = true
          this.previousOrganisation = _.clone(this.organisation)
        } catch (e) {
          console.error(e)
          this.showMessage('Saving did not succeed.', 'error')
          this.isSaving = false
          return
        }
      }
      try {
        isDataWritten = isDataWritten || await this.$refs.phoneList.onSave()
        isDataWritten = isDataWritten || await this.$refs.employeeList.onSave()
      } catch(e) {
          console.error(e)
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
  },

  async mounted() {
    if (this.$route.params.id === 'new') {
      return
    }
    try {
      const response = await api.get(`organisation/${this.$route.params.id}`)
      this.organisation = response.data
      this.previousOrganisation = _.clone(this.organisation)
    } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
    }
  },
}
</script>