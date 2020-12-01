<template>
  <div>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="item in items" :key="item.key" @click="onClick(item.key)">
          <v-list-item-title>
            {{ item.text | i18n }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">{{ label }}</v-card-title>
        <v-card-text>
          <div class="mb-4">{{ hint }}</div>
          <v-text-field v-if="type!='text'" :label="label" v-model="value"></v-text-field>
          <v-textarea v-if="type=='text'" :label="label" v-model="value" auto-grow outlined rows="1"></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="onSave()">
            {{ 'Save' | i18n }}
          </v-btn>
          <v-btn  text @click="dialog = false">
            {{ 'Cancel' | i18n }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '../services/api'

const allSettings = {
  inv_header: {
    text: 'Invoice header',
    hint: 'Enter HTML for the printable invoice header',
    type: 'text'
  },
  inv_footer: {
    text: 'Invoice footer',
    hint: 'Enter HTML for the printable invoice footer',
    type: 'text',
  }
}

export default {

  name: 'Settings',

  props: {
    keys: String,
  },

  data() {
    return {
      dialog: false,
      key: 'inv_header',
      label: '',
      value: '',
      hint: '',
      type: 'string',
      items: this.keys.split(',').
        map(key => key.replaceAll(':', '_')).
        // eslint-disable-next-line
        filter(key => allSettings.hasOwnProperty(key)).
        map(key => {
          return { ...allSettings[key], key }
        })
    }
  },

  methods: {
    async onClick(key) {
      this.key = key
      this.value = ''
      this.label = this.$i18n(allSettings[key].text)
      this.hint = this.$i18n(allSettings[key].hint)
      this.type = allSettings[key].type
      const dbKey = key.replaceAll('_', ':')
      try {
        const response = await api.get(`/setting/${dbKey}`)
        this.value = response.data.value
        this.dialog = true
      } catch (err) {
        console.errorlog(err)
        if (err.request.status === 404) {
          this.value = ''
          this.dialog = true
        }
      }
    },
    async onSave() {
      const dbKey = this.key.replaceAll('_', ':')
      try {
        await api.put(`/setting/${dbKey}`, api.nullIt({
          value: this.value
        }))
        this.dialog = false
      } catch (err) {
        console.error(err)
      }
    }
  },
}
</script>