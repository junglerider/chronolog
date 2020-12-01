<template>
  <v-form ref="form" v-if="user.hasRole('contacts')">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'Contact Details' | i18n }}</div>
          <span>{{ 'ID' | i18n }}: {{ person.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-select :label="'Title' | i18n" :items="titles" clearable v-model="person.title"></v-select>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'First Name' | i18n" :rules="nameRules" v-model="person.first_name"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Last Name' | i18n" :rules="nameRules" v-model="person.last_name"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-select :label="'Type' | i18n" :items="types" clearable v-model="person.type"></v-select>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Nick Name' | i18n" :rules="nameRules" v-model="person.nick_name"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-8 form-col">
          <v-textarea :label="'Street Address' | i18n" auto-grow rows="1" v-model="person.street_address"></v-textarea>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Postal Code' | i18n" v-model="person.postcode"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'City' | i18n" v-model="person.city"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'State/Province' | i18n" v-model="person.state_province"></v-text-field>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-autocomplete :label="'Country' | i18n" :items="countries" v-model="person.country"></v-autocomplete>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <date-input :label="'First Contact' | i18n" v-model="person.first_contact"></date-input>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <date-input :label="'Last Contact' | i18n" v-model="person.last_contact"></date-input>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-4 form-col">
          <v-text-field :label="'Updated at' | i18n" disabled v-model="updatedAt"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col">
          <v-textarea :label="'Notes' | i18n" auto-grow rows="1" v-model="person.comment"></v-textarea>
        </v-col>
      </v-row>
      <v-row v-if="person.id !== 'new'">
        <v-col class="col-12 col-sm-6 col-md-6 form-col">
          <phone-list :entityId="String(person.id)" ref="phoneList"/>
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-6 form-col">
          <employee-list entityType="person" :entityId="String(person.id)" ref="employeeList"/>
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
import api from '../services/api'
import DateCalc from '../services/DateCalc'
import countries from '../i18n/countries.json'

export default {

  components: {
    DateInput,
    PhoneList,
    EmployeeList,
  },

  data() {
    return {
      user: api.user,
      person: { id: 'new' },
      previousPerson: { id: 'new' },
      titles: ['Mr.', 'Mrs.', 'Ms.', 'Herr', 'Frau', 'Khun', 'Dr.', 'Prof.', 'Sir'],
      types: [
        { value: 'CUS', text: this.$i18n('Customer') },
        { value: 'SUP', text: this.$i18n('Supplier') },
        { value: 'PRV', text: this.$i18n('Private') },
        { value: 'PRS', text: this.$i18n('Prospect') },
        { value: 'EMP', text: this.$i18n('Employee') },
        { value: 'ASC', text: this.$i18n('Associate') },
      ],
      countries: countries.map(country => country.name),
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      nameRules: [
        () => Boolean(this.person.first_name || this.person.last_name || this.person.nick_name) ||
          this.$i18n('First, last or nick name must be given')
      ]
    }
  },

  computed: {
    updatedAt() {
      if (!this.person.updated_at) {
        return null
      }
      return this.$i18nDate(this.person.updated_at)
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
      if (!_.isEqual(this.person, this.previousPerson)) {
        try {
          const id = this.person.id
          this.person.updated_at = DateCalc.isoDate()
          if (id === 'new') {
            const response = await api.post(`/person`, api.nullIt(this.person))
            if (response.status === 201) {
              this.person.id = response.data.id
            }
          } else {
            await api.put(`/person/${id}`, api.nullIt(this.person))
          }
          isDataWritten = true
          this.previousPerson = _.clone(this.person)
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
      const response = await api.get(`/person/${this.$route.params.id}`)
      this.person = response.data
      this.previousPerson = _.clone(this.person)
    } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
    }
  },
}
</script>