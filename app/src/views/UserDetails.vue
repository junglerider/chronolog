<template>
  <v-form ref="form">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'User Details' | i18n }}</div>
          <span>{{ 'ID' | i18n }}: {{ user.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'User name' | i18n" v-model="user.login" :rules="requiredRule"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            :label="'Contact' | i18n"
            :items="persons"
            v-model="user.person_id"
            item-value="id"
            item-text="name"
            :rules="requiredRule"
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col" style="display: flex;">
          <div style="flex: 80%;">
            <v-textarea :label="'Notes' | i18n" v-model="user.notes" auto-grow rows="1"></v-textarea>
          </div>
          <div style="max-width: 180px; margin-left: auto; text-align: right">
            <v-checkbox :label="'Is Active' | i18n" class="mx-2" v-model="user.is_active" :true-value="1" :false-value="0"></v-checkbox>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="user.id !== 'new'">
        <v-col class="col-12 col-md-3 col-sm-6 form-col">
          <v-text-field :label="'Last visit' | i18n" v-model="lastVisit" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-3 col-sm-6 form-col">
          <v-text-field :label="'Total visits' | i18n" v-model="user.visits" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-3 col-sm-6 form-col">
          <v-text-field :label="'Number of tasks' | i18n" v-model="user.task_count" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-3 col-sm-6 form-col">
          <v-text-field :label="'Number of time sheet entries' | i18n" v-model="user.time_log_count" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row v-if="user.id !== 'new'">
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Created at' | i18n" v-model="createdAt" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Updated at' | i18n" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
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
import DateCalc from '../services/DateCalc'

export default {

  data() {

    return {
      user: { id: 'new', is_active: 1 },
      previousUser: { id: 'new' },
      persons: [],
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      requiredRule: [ (v) => Boolean(v) || this.$i18n('Required') ],
    }
  },

  computed: {

    updatedAt() {
      return this.user.updated_at ? this.$i18nDate(this.user.updated_at) : null
    },
    createdAt() {
      return this.user.created_at ? this.$i18nDate(this.user.created_at) : null
    },
    lastVisit() {
      return this.user.last_visit ? this.$i18nDate(this.user.last_visit) : null
    }
  },

  methods: {

    async onSave() {
      if (!this.$refs.form.validate()) {
        return
      }
      if (!_.isEqual(this.user, this.previousUser)) {
        this.isSaving = true
        let response
        try {
          if (this.user.id == 'new') {
            this.user.created_at = DateCalc.isoDateTime()
            response = await api.post('/user', api.nullIt(this.user))
            if (response.status === 201) {
              this.user.id = response.data.id
            }
          } else {
            this.user.updated_at = DateCalc.isoDateTime()
            response = await api.put(`/user/${this.user.id}`, api.nullIt(this.user))
          }
          this.showMessage('OK - Saved!')
          this.previousUser = _.cloneDeep(this.user)
        } catch (e) {
          console.error(e)
          const message = e.message.includes('status code 409') ?
            'This user name already exists.' : 'Saving did not succeed.'
          this.showMessage(message, 'error')
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
        const id = this.$route.params.id
        let response = await api.get(`/user/${id}`)
        this.user = response.data
        response = await api.get(`/task/count?filter[user_id][eq]=${id}`)
        this.user.task_count = response.data.count
        response = await api.get(`/timelog/count?filter[user_id][eq]=${id}`)
        this.user.time_log_count = response.data.count
        this.previousUser = _.clone(this.user)
      } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
      }
    }
    const response = await api.get(`/person?order=last_name`)
    this.persons = response.data.map(person => { return {
      id: person.id, name: [person.first_name || '', person.last_name || ''].join(' ')
    }})
  },

}
</script>