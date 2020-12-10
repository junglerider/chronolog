<template>
  <div>
    <task-edit :task="task" mode="normal" @task-edit-event="onTaskEdit" :key="'taskedit' + version"></task-edit>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
      <v-icon v-if="messageColor == 'info'" color="blue">mdi-alert-outline</v-icon>
      {{ messageText }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '../services/api'
import TaskEdit from '../components/TaskEdit'

export default {

  components: {
    TaskEdit
  },

  data() {
    return {
      user: api.user,
      task: { id: 'new' },
      message: false,
      messageColor: 'success',
      messageText: '',
      version: 0
    }
  },

  methods: {
    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },
    onTaskEdit(event) {
      if (event == 'canceled') {
        this.$router.back()
      } else if (event == 'saveOK') {
        this.version++
        this.showMessage('OK - Saved!')
      } else if (event == 'noChanges') {
        this.showMessage('No changes were made.', 'info')
      } else if (event == 'customerChanged') {
        this.showMessage('The customer has been changed.', 'info')
      } else if (event == 'saveError') {
        this.showMessage('Saving did not succeed.', 'error')
      } else if (event == 'loadError') {
        this.showMessage('Record could not be loaded.', 'error')
      }
    }
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
          user_id: this.user.id
        }
      } else {
        response = await api.get(`/task/${this.$route.params.id}`)
        this.task = response.data
      }
    } catch(e) {
      console.error(e)
      this.showMessage('Record could not be loaded.', 'error')
    }
  },
}
</script>