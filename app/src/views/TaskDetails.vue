<template>
  <v-form ref="form">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'Task Details' | i18n }}</div>
          <span>{{ 'ID' | i18n }}: {{ task.id }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Name' | i18n" v-model="task.name" :rules="requiredRule"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-checkbox :label="'Active' | i18n" class="mx-2" v-model="task.is_active" :true-value="1" :false-value="0"></v-checkbox>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
            <v-autocomplete
              v-if="isActiveProject(task.parent_id)"
              :label="'Project' | i18n"
              v-model="task.parent_id"
              :items="projects"
              item-value="id"
              item-text="name"
              :rules="requiredRule"
              @change="onProjectSelect"
              :return-object="true"
            >
              <template v-slot:item="data">
                <template v-if="typeof data.item !== 'object'">
                  <v-list-item-content v-text="data.item"></v-list-item-content>
                </template>
                <template v-else>
                  <v-list-item-content>
                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                    <v-list-item-subtitle v-html="data.item.customer_name"></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </template>
            </v-autocomplete>
            <v-text-field
              v-else
              :label="'Project' | i18n"
              v-model="task.parent_name"
              readonly tabindex="-1"
            ></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Customer' | i18n" v-model="task.customer_name" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col">
          <v-textarea :label="'Description' | i18n" v-model="task.description" auto-grow rows="1"></v-textarea>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Created at' | i18n" v-model="createdAt" readonly tabindex="-1"></v-text-field>
        </v-col>
        <v-col class="col-12 col-md-6 form-col">
          <v-text-field :label="'Updated at' | i18n" v-model="updatedAt" readonly tabindex="-1"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-md-12 form-col" align="right">
          <v-btn color="primary" :disabled="isSaving" @click="onSave">{{ 'Save' | i18n }}</v-btn>
          <v-btn class="ml-2" @click="$router.back()">{{ 'Cancel' | i18n }}</v-btn>
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
import api, { nullIt } from '../services/api'
import DateCalc from '../services/DateCalc'

export default {

  data() {
    return {
      userId: 1,
      task: { id: 'new' },
      previousTask: { id: 'new' },
      projects: [],
      message: false,
      messageColor: 'success',
      messageText: '',
      isSaving: false,
      requiredRule: [
        (v) => Boolean(v) || this.$i18n('Required')
      ]
    }
  },

  computed: {

    updatedAt() {
      if (!this.task.updated_at) {
        return null
      }
      return this.$i18nDate(this.task.updated_at)
    },

    createdAt() {
      if (!this.task.created_at) {
        return null
      }
      return this.$i18nDate(this.task.created_at)
    }
  },

  methods: {

    onProjectSelect(parentTask) {
      if (this.task.id !== 'new' && parentTask.customer_id != this.task.customer_id) {
        this.showMessage('The customer has been changed.', 'info')
      }
      this.task.customer_id = parentTask.customer_id
      this.task.customer_name = parentTask.customer_name
      this.task.parent_id = parentTask.id
    },

    isActiveProject(id) {
      for (let task of this.projects) {
        if (task.id == id) {
          return true
        }
      }
      return false
    },

    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },

    async onSave() {
      if (!this.$refs.form.validate()) {
        return
      }
      if (!_.isEqual(this.task, this.previousTask)) {
        this.isSaving = true
        try {
          if (this.task.id == 'new') {
            this.task.created_at = DateCalc.isoDateTime()
            const response = await api.post('/task', nullIt(this.task))
            if (response.status === 201) {
              this.task.id = response.data.id
            }
          } else {
            this.task.updated_at = DateCalc.isoDateTime()
            await api.put(`/task/${this.task.id}`, nullIt(this.task))
          }
          this.showMessage('OK - Saved!')
          this.previousTask = _.cloneDeep(this.task)
        } catch (e) {
          console.error(e)
          this.showMessage('Saving did not succeed.', 'error')
        }
        this.isSaving = false
      } else {
        this.showMessage('No changes were made.', 'info')
      }
    },
  },

  async mounted() {
    let response
    try {
      if (this.$route.params.id === 'new') {
        this.task = {
          id: 'new',
          is_active: 1,
          is_closed: 0,
          is_leaf: 1,
          user_id: this.userId
        }
      } else {
        response = await api.get(`/task/${this.$route.params.id}`)
        this.task = response.data
        this.previousTask = _.clone(this.task)
      }
      response = await api.get(`/todo/${this.userId}/projects`)
      this.projects = response.data
    } catch(e) {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
    }
  },
}
</script>