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
        <v-text-field :label="'Name' | i18n" v-model="task.name" :rules="requiredRule" ref="nameInput"></v-text-field>
      </v-col>
      <v-col class="col-12 col-md-6 form-col" style="display: flex">
        <v-checkbox :label="'Active' | i18n" class="mx-2" v-model="task.is_active" :true-value="1" :false-value="0"></v-checkbox>
        <v-checkbox :label="'Closed' | i18n" class="mx-2" v-model="task.is_closed" :true-value="1" :false-value="0" v-if="user.hasRole('admin')"></v-checkbox>
      </v-col>
    </v-row>
    <v-row v-if="mode == 'normal'">
      <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            v-if="isInList(task.parent_id, projects)"
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
    <v-row v-if="mode == 'admin'">
      <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            v-if="isInList(task.customer_id, customers)"
            :label="'Customer' | i18n"
            v-model="task.customer_id"
            :items="customers"
            item-value="id"
            item-text="name"
            :rules="requiredRule"
          ></v-autocomplete>
          <v-text-field
            v-else
            :label="'Customer' | i18n"
            v-model="task.customer_name"
            readonly tabindex="-1"
          ></v-text-field>
      </v-col>
      <v-col class="col-12 col-md-6 form-col">
          <v-autocomplete
            v-if="isInList(task.user_id, users)"
            :label="'Assigned to' | i18n"
            v-model="task.user_id"
            :items="users"
            item-value="id"
            item-text="name"
          ></v-autocomplete>
          <v-text-field
            v-else
            :label="'Assigned to' | i18n"
            v-model="task.user_name"
            readonly tabindex="-1"
          ></v-text-field>
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
          <v-btn class="ml-2" @click="$emit('task-edit-event', 'canceled')">{{ 'Cancel' | i18n }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import _ from 'lodash'
import api from '../services/api'
import DateCalc from '../services/DateCalc'

export default {
  name: 'TaskEdit',
  props: ['task', 'mode'],

  data() {
    return {
      user: api.user,
      previousTask: { id: 'new' },
      projects: [],
      customers: [],
      users: [],
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
        this.$emit('task-edit-event', 'customerChanged')
      }
      this.task.customer_id = parentTask.customer_id
      this.task.customer_name = parentTask.customer_name
      this.task.parent_id = parentTask.id
    },
    isInList(id, list) {
      if (!id || id === 'new') return true
      return list.find(element => element.id == id)
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
            const response = await api.post('/task', api.nullIt(this.task))
            if (response.status === 201) {
              this.task.id = response.data.id
              this.$emit('task-edit-event', 'insertOK')
            }
          } else {
            this.task.updated_at = DateCalc.isoDateTime()
            await api.put(`/task/${this.task.id}`, api.nullIt(this.task))
          }
          this.$emit('task-edit-event', 'saveOK')
          this.previousTask = _.cloneDeep(this.task)
        } catch (e) {
          console.error(e)
          this.$emit('task-edit-event', 'saveError')
        }
        this.isSaving = false
      } else {
        this.$emit('task-edit-event', 'noChanges')
      }
    },
  },

  async mounted() {
    try {
      this.previousTask = _.clone(this.task)
      if (this.mode == 'normal') {
        const response = await api.get(`/todo/${this.user.id}/projects`)
        this.projects = response.data
      } else if (this.mode == 'admin') {
        let response = await api.get(`/customer?filter[is_retired][eq]=0&order=name:ASC`)
        this.customers = response.data
        response = await api.get(`/user?filter[is_active][eq]=1`)
        this.users = response.data
        this.users.unshift({id: null, name: this.$i18n('all')})
      }
      this.$nextTick(() => this.$refs.nameInput.focus())
    } catch(e) {
      this.$emit('task-edit-event', 'loadError')
    }
  }
}
</script>
