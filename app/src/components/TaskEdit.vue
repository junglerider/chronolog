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
        <v-col class="col-12 col-sm-1 form-col">
          <v-tooltip v-if="taskid  != 'new'" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click="onExpand">
                <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ 'Time sheet entries for this task' | i18n }}</span>
          </v-tooltip>
        </v-col>
        <v-col class="col-12 col-sm-11 form-col" align="right">
          <v-btn color="primary" :disabled="isSaving" @click="onSave">{{ 'Save' | i18n }}</v-btn>
          <v-btn class="ml-2" @click="$emit('task-edit-event', 'canceled')">{{ 'Cancel' | i18n }}</v-btn>
          <v-dialog v-if="this.mode == 'normal' && this.task.id != 'new'" v-model="reassignDialog" persistent max-width="500">
            <template v-slot:activator="{ on, attrs }">
              <v-btn :disabled="!isReassignable()" class="ml-2" v-bind="attrs" v-on="on">{{ 'Reassign' | i18n }}</v-btn>
            </template>
            <v-card>
              <v-card-title class="headline" primary-title>
                {{ 'Reassign' | i18n }}
              </v-card-title>
              <v-card-text>
                <div>{{ 'Reassign this task to' | i18n }}:</div>
                <v-autocomplete
                  :label="'Name' | i18n"
                  v-model="task.user_id"
                  :items="users"
                  item-value="id"
                  item-text="name"
                ></v-autocomplete>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="onReassign(true)">
                  {{ "OK" | i18n }}
                </v-btn>
                <v-btn text @click="onReassign(false)">
                  {{ "Cancel" | i18n }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
      <v-expand-transition>
        <v-row v-if="isExpanded">
          <v-col class="col-12 col-md-12 form-col mt-8">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <th class="text-left pl-4">{{ 'Name' | i18n }}</th>
                  <th class="text-left pl-4">{{ 'Date' | i18n }}</th>
                  <th class="text-left pl-4">{{ 'Description' | i18n }}</th>
                  <th class="text-right pr-4">{{ 'Hours' | i18n }}</th>
                </thead>
                <tbody v-if="timelog.length == 0">
                  <tr><td colspan="4" style="text-align: center">{{ 'No data to display' | i18n }}</td></tr>
                </tbody>
                <tbody v-else>
                  <tr v-for="rec in timelog" :key="rec.id">
                    <td class="text-left pl-4">{{ rec.user_name }}</td>
                    <td class="text-left pl-4">{{ rec.date | i18nDate }}</td>
                    <td class="text-left pl-4">{{ rec.description }}</td>
                    <td class="text-right pr-4">{{ $i18nDecToHrs(rec.duration) }}</td>
                  </tr>
                  <tr>
                    <th colspan="3" class="text-left pl-4">{{ 'Total hours' | i18n }}</th>
                    <th class="text-right pr-4">{{ $i18nDecToHrs(timelogTotal) }}</th>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-expand-transition>
    </v-container>
  </v-form>
</template>

<script>
import api from '../services/api'
import DateCalc from '../services/DateCalc'
import _ from 'lodash'

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
      reassignDialog: false,
      requiredRule: [
        (v) => Boolean(v) || this.$i18n('Required')
      ],
      isExpanded: false,
      timelog: [],
      timelogTotal: 0,
    }
  },

  computed: {
    updatedAt() {
      return this.task.updated_at ? this.$i18nDate(this.task.updated_at) : null
    },
    createdAt() {
      return this.task.created_at ? this.$i18nDate(this.task.created_at) : null
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
    isReassignable() {
      let isReassignable = this.mode == 'normal' && this.task.id != 'new' && this.task.is_closed == 0
      if (!this.user.hasRole('admin')) {
         isReassignable = isReassignable && this.task.user_id
      }
      return isReassignable
    },
    async onReassign(doPersist) {
      if (doPersist) {
        await this.onSave()
      } else {
        this.task.user_id = this.previousTask.user_id
      }
      this.reassignDialog = false
    },
    async onExpand() {
      this.isExpanded = !this.isExpanded
      if (this.isExpanded && this.timelog.length == 0) {
        try {
          const response = await api.get(`/timelog/report?filter[task_id][eq]=${this.task.id}&order=date`)
          this.timelog = response.data
          this.timelogTotal = response.data.reduce((sum, rec) => sum + Number(rec.duration), 0)
        } catch (err) {
          this.$emit('task-edit-event', 'loadError')
        }
      }
    }
  },

  async mounted() {
    try {
      let response = await api.get(`/user?filter[is_active][eq]=1`)
      this.users = response.data
      if (this.mode == 'normal') {
        response = await api.get(`/todo/${this.user.id}/projects`)
        this.projects = response.data
      } else if (this.mode == 'admin') {
        response = await api.get(`/customer?filter[is_retired][eq]=0&order=name:ASC`)
        this.customers = response.data
      }
      if (this.user.hasRole('admin')) {
        this.users.unshift({id: null, name: this.$i18n('all')})
      }
      this.$nextTick(() => this.$refs.nameInput.focus())
    } catch(e) {
      this.$emit('task-edit-event', 'loadError')
    }
    this.previousTask = _.clone(this.task)
  }
}
</script>
