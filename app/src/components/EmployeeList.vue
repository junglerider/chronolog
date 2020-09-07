<template>
  <div>
    <div style="display: flex">
      <div class="page-title" style="margin-bottom: 16px">
        {{ (entityType === 'person' ? 'Organisations' : 'Employees') | i18n }}
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="add()" style="margin-left: auto">
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ 'Add' | i18n }}</span>
      </v-tooltip>
    </div>
    <div v-for="employee in employeeList" :key="employee.employee_id" style="display: flex">
      <v-container style="padding:0">
        <v-row>
          <v-col class="col-12 col-sm-12 col-md-6 form-col">
            <auto-complete
              :label="'Name' | i18n"
              :item="{ id: (entityType === 'person' ? employee.organisation_id : employee.person_id), name: employee.name }"
              :lookup="entityType === 'person'? orgLookup : personLookup"
              min-search-length="2"
              :rules="requiredRule"
              @change="(item) => onChange(item, employee)"
              clearable
            />
          </v-col>
          <v-col class="col-12 col-sm-12 col-md-6 form-col">
            <v-text-field :label="'Position' | i18n" v-model="employee.position"></v-text-field>
          </v-col>
        </v-row>
      </v-container>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on" @click="remove(employee.employee_id)" style="margin-left: auto; margin-top: 0.8em">
              <v-icon>mdi-minus-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ 'Delete' | i18n }}</span>
        </v-tooltip>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import api from '../services/api'
import AutoComplete from './AutoComplete'

export default {
  name: 'EmployeeList',
  props: {
    entityId: String,
    entityType: String,
  },

  components: {
    AutoComplete
  },

  data() {
    return {
      employeeList: [],
      previousEmployeeList: [],
      deleteList: [],
      requiredRule: [ (v) => (Boolean(v) || this.$i18n('Required')) ],
      orgs: []
    }
  },

  methods: {
    async getData() {
      if (!this.entityId || this.entityId === 'new') {
        return
      }
      try {
        const listType = this.entityType === 'person' ? 'organisations' : 'persons'
        const response = await api.get(`/${this.entityType}/${this.entityId}/${listType}`)
        if (response.data && Array.isArray(response.data)) {
          this.employeeList = response.data
          this.previousEmployeeList = _.cloneDeep(this.employeeList)
        }
      } catch(e) {
        console.error(e)
      }
    },

    async orgLookup(searchTerm) {
      try {
        const response = await api.get(`/organisation?filter[name][like]=${encodeURIComponent(searchTerm + '%')}&order=name`)
        return response.data
      } catch (e) {
        console.error(e)
      }
      return []
    },

    async personLookup(searchTerm) {
      try {
        const term = encodeURIComponent(searchTerm.split(' ')[0] + '%')
        const response = await api.get(`/person?filter[first_name][like]=${term}&filter[last_name][like]=${term}&combine=OR`)
        return response.data
      } catch (e) {
        console.error(e)
      }
      return []
    },

    onChange(item, employee) {
      if (this.entityType === 'person') {
        employee.organisation_id = item ? item.id : null
      } else {
        employee.person_id = item ? item.id : null
      }
      employee.name = item ? item.name : null
    },

    async onSave() {
      let recordsWritten = 0
      for (let employee of this.employeeList) {
        if (typeof employee.employee_id === 'string' && employee.employee_id.startsWith('new')) {
          const response = await api.post('/employee', api.nullIt(employee))
          if (response.status === 201) {
            employee.employee_id = response.data.id
            recordsWritten++
          }
        } else if (!this.isInList(this.previousEmployeeList, employee)) {
          await api.put(`/employee/${employee.employee_id}`, api.nullIt(employee))
          recordsWritten++
        }
      }
      for (let id of this.deleteList) {
        await api.delete(`/employee/${id}`)
        recordsWritten++
      }

      this.deleteList = []
      this.previousEmployeeList = _.cloneDeep(this.employeeList)
      return recordsWritten
    },

    isInList(list, item) {
      for (let listItem of list) {
        if (_.isEqual(listItem, item)) {
          return true
        }
      }
      return false
    },

    add() {
      this.employeeList.push({
        employee_id: _.uniqueId('new'),
        organisation_id: this.entityType === 'organisation' ? this.entityId : null,
        person_id: this.entityType === 'person' ? this.entityId : null,
        position: null,
        name: ''
      })
    },

    remove(id) {
      if (typeof id !== 'string' || !id.startsWith('new')) {
        this.deleteList.push(id)
      }
      this.employeeList = this.employeeList.filter(employee => employee.employee_id != id)
    },

  },

  watch: {
    entityId() {
      this.getData()
    }
  },

  created() {
    this.getData()
  },
}
</script>
