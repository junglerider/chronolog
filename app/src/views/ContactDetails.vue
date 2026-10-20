<template>
  <v-form ref="form" v-if="user.hasRole('contacts')">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ $i18n('Contact Details') }}</div>
          <span>{{ $i18n('ID') }}: {{ person.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-select :label="$i18n('Title')" :items="titles" clearable v-model="person.title"></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('First Name')" :rules="nameRules" v-model="person.first_name"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('Last Name')" :rules="nameRules" v-model="person.last_name"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-select :label="$i18n('Type')" :items="types" clearable v-model="person.type"></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('Nick Name')" :rules="nameRules" v-model="person.nick_name"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="8" class="form-col">
          <v-textarea :label="$i18n('Street Address')" auto-grow rows="1" v-model="person.street_address"></v-textarea>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('Postal Code')" v-model="person.postcode"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('City')" v-model="person.city"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('State/Province')" v-model="person.state_province"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-autocomplete :label="$i18n('Country')" :items="countries" v-model="person.country"></v-autocomplete>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <date-input :label="$i18n('First Contact')" v-model="person.first_contact"></date-input>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <date-input :label="$i18n('Last Contact')" v-model="person.last_contact"></date-input>
        </v-col>
        <v-col cols="12" sm="6" md="4" class="form-col">
          <v-text-field :label="$i18n('Updated at')" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="12" class="form-col">
          <v-textarea :label="$i18n('Notes')" auto-grow rows="1" v-model="person.comment"></v-textarea>
        </v-col>
      </v-row>
      <v-row v-if="person.id !== 'new'">
        <v-col cols="12" sm="6" md="6" class="form-col">
          <phone-list :entityId="String(person.id)" ref="phoneList"/>
        </v-col>
        <v-col cols="12" sm="6" md="6" class="form-col">
          <employee-list entityType="person" :entityId="String(person.id)" ref="employeeList"/>
        </v-col>
      </v-row>
      <v-row style="padding-top: 15px">
        <v-col cols="12" md="12" class="form-col text-right">
          <v-btn primary color="primary" :disabled="isSaving" @click="onSave">{{ $i18n('Save') }}</v-btn>
          <v-btn class="ml-2" @click="$router.back()">{{ $i18n('Cancel') }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" location="top" variant="tonal">
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
        { value: 'CUS', title: this.$i18n('Customer') },
        { value: 'SUP', title: this.$i18n('Supplier') },
        { value: 'PRV', title: this.$i18n('Private') },
        { value: 'PRS', title: this.$i18n('Prospect') },
        { value: 'EMP', title: this.$i18n('Employee') },
        { value: 'ASC', title: this.$i18n('Associate') },
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
      if (!(await this.$refs.form.validate()).valid) {
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