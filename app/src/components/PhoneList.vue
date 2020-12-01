<template>
  <div>
    <div style="display: flex">
      <div class="page-title" style="margin-bottom: 16px">{{ 'Phone/Email' | i18n }}</div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="add()" style="margin-left: auto">
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ 'Add' | i18n }}</span>
      </v-tooltip>
    </div>
    <div v-for="item in phoneList" :key="item.id" style="display: flex">
      <v-container style="padding:0">
        <v-row>
          <v-col class="col-12 col-sm-12 col-md-4 form-col">
            <v-select :label="'Type' | i18n" :items="types" v-model="item.type" :rules="requiredRule"></v-select>
          </v-col>
          <v-col class="col-12 col-sm-12 col-md-8 form-col">
            <v-text-field :label="dynamicLabel(item.type)" v-model="item.entry" :rules="requiredRule"></v-text-field>
          </v-col>
        </v-row>
      </v-container>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on" @click="remove(item.id)" style="margin-left: auto; margin-top: 0.8em">
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

export default {

  name: 'PhoneList',

  props: {
    entityId: String,
  },

  data() {
    return {
      phoneList: [],
      previousPhoneList: [],
      deleteList: [],
      requiredRule: [ (v) => (Boolean(v) || this.$i18n('Required')) ],
      types: [
        { value: 'PHO', text: this.$i18n('Phone') },
        { value: 'MOB', text: this.$i18n('Mobile') },
        { value: 'EML', text: this.$i18n('Email') },
        { value: 'FAX', text: this.$i18n('Fax') },
        { value: 'WRK', text: this.$i18n('Office') },
        { value: 'HOM', text: this.$i18n('Home') },
        { value: 'WEB', text: this.$i18n('Website') },
        { value: 'LIN', text: this.$i18n('Line') },
        { value: 'WAP', text: this.$i18n('WhatsApp') },
      ],
    }
  },

  methods: {
    async getData() {
      if (!this.entityId || this.entityId === 'new') {
        return
      }
      try {
        const response = await api.get(`/contact?filter[entity_id][eq]=${this.entityId}`)
        if (response.data && Array.isArray(response.data)) {
          this.phoneList = response.data
          this.previousPhoneList = _.cloneDeep(this.phoneList)
        }
      } catch(e) {
        console.error(e)
      }
    },

    async onSave() {
      let recordsWritten = 0
      for (let phoneItem of this.phoneList) {
        if (typeof phoneItem.id === 'string' && phoneItem.id.startsWith('new')) {
          const response = await api.post('/contact', api.nullIt(phoneItem))
          if (response.status === 201) {
            phoneItem.id = response.data.id
            recordsWritten++
          }
        } else if (!this.isInList(this.previousPhoneList, phoneItem)) {
          await api.put(`/contact/${phoneItem.id}`, api.nullIt(phoneItem))
          recordsWritten++
        }
      }
      for (let id of this.deleteList) {
        await api.delete(`/contact/${id}`)
        recordsWritten++
      }

      this.deleteList = []
      this.previousPhoneList = _.cloneDeep(this.phoneList)
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
      this.phoneList.push({
        id: _.uniqueId('new'),
        entity_id: this.entityId,
        type: null,
        entry: null
      })
    },

    remove(id) {
      if (typeof id !== 'string' || !id.startsWith('new')) {
        this.deleteList.push(id)
      }
      this.phoneList = this.phoneList.filter(item => item.id != id)
    },

    dynamicLabel(type) {
      for (let t of this.types) {
        if (t.value === type) {
          return t.text
        }
      }
      return ''
    }
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
