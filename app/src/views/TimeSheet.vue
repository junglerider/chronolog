<template>
  <div>
    <v-toolbar flat color="white" class="mb-4" height="100px" bottom>
    <calendar-leaflet :date="date" class="ml-2 mr-4"></calendar-leaflet>
      <div class="page-title">
        {{ 'Daily Time Sheet' | i18n }}
      </div>
      <v-btn fab text small class="ml-2" @click="navigate(-1)">
        <v-icon small>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn fab text small class="mr-2" @click="navigate(1)">
        <v-icon small>mdi-chevron-right</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="onAdd">
        <v-icon left>mdi-plus-circle-outline</v-icon>
        {{ 'Add' | i18n }}
      </v-btn>
      <v-dialog v-model="deleteDialog" max-width="500">
        <template v-slot:activator="{ on, attrs }">
        <v-btn
          outlined
          :disabled="!selected || !selected.length"
          color="primary"
          class="ml-2"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon left>mdi-delete</v-icon>
          {{ 'Delete' | i18n }}
        </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline" primary-title>
            {{ 'Delete' | i18n }}
          </v-card-title>
          <v-card-text>
            <span v-if="selected.length > 1">{{ 'Are you sure you want to delete {1} records?' | i18n(selected.length) }}</span>
            <span v-else>{{ 'Are you sure you want to delete this record?' | i18n }}</span>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="onDelete">
              {{ "OK" || i18n }}
            </v-btn>
            <v-btn text @click="deleteDialog = false">
              {{ "Cancel" || i18n }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <v-form ref="form">
      <v-container fluid style="padding-left: 30px; padding-right: 30px" @keyup="keyControl">
        <v-row v-for="item in log" :key="item.id">
          <v-col class="col-12 col-sm-2 form-col" style="display: flex">
            <div style="flex: 50%; max-width: 50px">
              <v-btn v-if="isNew(item)" icon @click="remove(item.id)" style="margin-top: 12px; margin-left: -5px">
                <v-icon>mdi-minus-circle-outline</v-icon>
              </v-btn>
              <v-checkbox v-else v-model="selected" :value="item.id"></v-checkbox>
            </div>
            <div style="flex: 80%">
              <v-text-field
                :label="'Hours' | i18n"
                v-model="item.duration"
                :rules="hoursInputRules"
                @change="onChangeHours"
                ref="hours"
                >
              </v-text-field>
            </div>
          </v-col>
          <v-col class="col-12 col-sm-3 form-col">
            <v-autocomplete
              v-if="!item.task_id || taskIds.indexOf(item.task_id) > -1"
              :label="item.task_id ? '' : 'Task' | i18n"
              v-model="item.task_id"
              :items="tasks"
              item-value="id"
              item-text="name"
              :rules="requiredRule"
              :messages="item.customer_name"
              @change="(taskId) => onTaskSelect(taskId, item)"
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
              readonly
              v-model="item.task_name"
              :messages="item.customer_name"
            ></v-text-field>
          </v-col>
          <v-col class="col-12 col-sm-7 form-col">
            <v-textarea :label="'Description' | i18n" auto-grow rows="1" v-model="item.description"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="col-12 col-sm-2 form-col" style="display: flex">
            <div style="flex: 50%; max-width: 50px">
            </div>
            <div style="flex: 80%">
              <v-text-field :label="'Total hours' | i18n" v-model="totalHours" readonly></v-text-field>
            </div>
          </v-col>
          <v-col class="col-12 col-sm-10 form-col" align="right">
            <v-btn color="primary" @click="onSave" style="margin-right: -16px">
              <v-icon left>mdi-content-save</v-icon>
              {{ 'Save' | i18n }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
        {{ messageText }}
      </v-snackbar>
    </v-form>
  </div>
</template>

<script>
import _ from 'lodash'
import api from '../services/api'
import DateCalc from '../services/DateCalc'
import CalendarLeaflet from '../components/CalendarLeaflet'

export default {
  components: {
    CalendarLeaflet,
  },
  data() {
    return {
      date: this.$route.params.date || DateCalc.isoDate(),
      user: api.user,
      log: [],
      selected: [],
      tasks: [],
      taskIds: [],
      totalHours: 0,
      deleteDialog: false,
      message: false,
      messageColor: 'success',
      messageText: '',
      requiredRule: [ v => (Boolean(v) || this.$i18n('Required')) ],
      hoursInputRules: [
        v => (Boolean(v) || this.$i18n('Required')),
        v => (Number(v) == v || this.$i18n('Must be a number')),
        v => (Number(v) > 0 || this.$i18n('Must be larger than zero')),
      ],
    }
  },
  watch: {
    $route() {
      this.date = this.$route.params.date || DateCalc.isoDate()
      this.getData()
    }
  },
  methods: {
    navigate(days) {
      const newDate = (new Date(this.date))
      newDate.setDate(newDate.getDate() + days)
      this.$router.push(`/time-sheet/${DateCalc.isoDate(newDate)}`)
    },
    async getData() {
      try {
        const response = await api.get(`/timelog?filter[date][eq]=${this.date}&filter[user_id][eq]=${this.user.id}`)
        this.log = response.data
        this.previousLog = _.cloneDeep(this.log)
        this.onChangeHours()
      } catch(e) {
        console.error(e)
      }
    },
    onAdd() {
      this.log.push({
        id: _.uniqueId('new'),
        user_id: this.user.id,
        date: this.date,
      })
      this.$nextTick(() => this.$refs.hours[this.$refs.hours.length-1].focus())
    },
    remove(itemId) {
      this.log = this.log.filter(item => item.id !== itemId)
    },
    async onDelete() {
      try {
        for (let id of this.selected) {
          await api.delete(`/timelog/${id}`)
        }
        this.showMessage('OK - Deleted!')
        this.selected = []
      } catch (e) {
        console.error(e)
        this.showMessage('Deletion did not succeed.', 'error')
      }
      this.getData()
      this.deleteDialog = false
    },
    onTaskSelect(taskId, logItem) {
      for (let task of this.tasks) {
        if (task.id === taskId) {
          logItem.customer_name = task.customer_name
          return
        }
      }
    },
    isNew(log) {
      return (typeof log.id === 'string') && log.id.startsWith('new')
    },
    onChangeHours() {
      this.totalHours = this.log.reduce((total, item) => total + (Number(item.duration) || 0), 0)
    },
    async onSave() {
      if (!this.$refs.form.validate()) {
        return
      }
      let recordsWritten = 0
      try {
        for (let log of this.log) {
          if (this.isNew(log)) {
            log.updated_at = DateCalc.isoDateTime()
            const response = await api.post('/timelog', api.nullIt(log))
            if (response.status === 201) {
              log.id = response.data.id
              recordsWritten++
            }
          } else if (!this.isInList(this.previousLog, log)) {
            log.updated_at = DateCalc.isoDateTime()
            await api.put(`/timelog/${log.id}`, api.nullIt(log))
            recordsWritten++
          }
        }
        this.previousLog = _.cloneDeep(this.log)
      } catch (e) {
        console.error(e)
        this.showMessage('Saving did not succeed.', 'error')
        this.isSaving = false
        return
      }
      if (recordsWritten > 0) {
        this.showMessage('OK - Saved!')
      } else {
        this.showMessage('No changes were made.', 'info')
      }
      this.isSaving = false
    },
    isInList(list, item) {
      for (let listItem of list) {
        if (_.isEqual(listItem, item)) {
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
    keyControl(val) {
      switch (val.key) {
        case 'Insert':
          this.onAdd()
          break
        case 'PageUp':
          this.navigate(-1)
          break
        case 'PageDown':
          this.navigate(1)
          break
      }
    }
  },
  async mounted() {
    this.getData()
    try {
      const response = await api.get(`/todo/${this.user.id}?order=id:desc`)
      this.tasks = response.data.filter(task => task.is_active)
      this.taskIds = this.tasks.map(item => item.id)
    } catch(e) {
      console.error(e)
    }
  }
}
</script>