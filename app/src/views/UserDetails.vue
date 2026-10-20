<template>
  <v-form ref="form" v-if="loggedInUser.hasRole('admin')">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ $i18n('User Details') }}</div>
          <span>{{ $i18n('ID') }}: {{ user.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" class="form-col">
          <v-text-field :label="$i18n('User name')" v-model="user.login" :rules="requiredRule"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="form-col">
          <v-autocomplete
            :label="$i18n('Contact')"
            :items="persons"
            v-model="user.person_id"
            item-value="id"
            item-title="name"
            :rules="requiredRule"
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col style="display: flex;" cols="12" md="12" class="form-col">
          <div style="flex: 80%;">
            <v-textarea :label="$i18n('Notes')" v-model="user.notes" auto-grow rows="1"></v-textarea>
          </div>
          <div style="max-width: 180px; margin-left: auto; text-align: right">
            <v-checkbox :label="$i18n('Is Active')" class="mx-2" v-model="user.is_active" :true-value="1" :false-value="0"></v-checkbox>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" class="form-col">
          <v-select
          v-model="roles"
          :label="$i18n('Access control')"
          :items="allRoles"
          multiple
          chips
          @update:model-value="onChangeRoles"
        ></v-select>
        </v-col>
        <v-col cols="12" sm="6" class="form-col">
          <v-alert v-if="user.password == 0" type="warning" variant="outlined">
            {{ $i18n('This account is not password-protected.') }}
          </v-alert>
        </v-col>
      </v-row>
      <v-row v-if="user.id !== 'new'">
        <v-col cols="12" sm="3" class="col-xs-6 form-col">
          <v-text-field :label="$i18n('Last visit')" v-model="lastVisit" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3" class="col-xs-6 form-col">
          <v-text-field :label="$i18n('Total visits')" v-model="user.visits" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3" class="col-xs-6 form-col">
          <v-text-field :label="$i18n('Number of tasks')" v-model="user.task_count" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3" class="col-xs-6 form-col">
          <v-text-field :label="$i18n('Number of time sheet entries')" v-model="user.time_log_count" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row v-if="user.id !== 'new'">
        <v-col cols="12" sm="6" class="form-col">
          <v-text-field :label="$i18n('Created at')" v-model="createdAt" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="form-col">
          <v-text-field :label="$i18n('Updated at')" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" class="form-col text-right">
          <v-btn class="mt-4" color="primary" :disabled="isSaving" @click="onSave">{{ $i18n('Save') }}</v-btn>
          <v-btn class="ml-2 mt-4" @click="$router.back()">{{ $i18n('Cancel') }}</v-btn>
          <v-btn v-if="user.password != 0" class="ml-2 mt-4" @click="onResetPassword">{{ $i18n('Reset password') }}</v-btn>
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
import DateCalc from '../services/DateCalc'

export default {

  data() {
    return {
      loggedInUser: api.user,
      user: { id: 'new', is_active: 1 },
      previousUser: { id: 'new' },
      persons: [],
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      allRoles: [
        { value: 'admin', title: this.$i18n('Administrator') },
        { value: 'invoicing', title: this.$i18n('Invoicing') },
        { value: 'reporting', title: this.$i18n('Reporting') },
        { value: 'contacts', title: this.$i18n('Contacts') },
      ],
      roles: [],
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
      if (!(await this.$refs.form.validate()).valid) {
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
    onChangeRoles(val) {
      this.user.roles = val && val.length ? val.join(',') : null
    },
    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },
    async onResetPassword() {
      if (confirm(this.$i18n(`Delete the user's password and allow access without password?`))) {
        try {
          await api.delete(`/user/${this.user.id}/password`)
          this.user.password = 0
          this.showMessage('OK - Deleted!')
        } catch (err) {
          this.showMessage('Deletion did not succeed.', 'error')
        }
      }
    }
  },

  async mounted() {
    if (this.$route.params.id !== 'new') {
      try {
        const id = this.$route.params.id
        let response = await api.get(`/user/${id}`)
        this.user = response.data
        this.roles = this.user.roles ? this.user.roles.split(',') : []
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