<template>
    <div class="report-container">
      <div class="report-title">{{ 'Project summary' | i18n }}</div>
      <div>
        {{ "Project" | i18n }}: {{ project.name }}
      </div>
      <div class="report-subtitle">
        <span v-if="userId > 0">{{ 'Name' | i18n }}: {{ user.first_name }} {{ user.last_name }}</span>
      </div>
      <table class="report-body">
        <tr>
          <th>{{ 'Project/Task' | i18n }}</th>
          <th class="report-right">{{ 'Hours' | i18n }}</th>
        </tr>
        <tr v-for="rec of data" :key="rec.id">
          <td :class="{highlight: rec.is_leaf == 0}">{{ rec.path }}</td>
          <td class="report-right report-nowrap">
            <span :class="{highlight: rec.is_leaf == 0}">{{ $i18nDecToHrs(rec.hours) }}</span>
          </td>
        </tr>
      <tr>
        <th>{{ "Total" | i18n }}</th>
        <th class="report-right">{{ $i18nDecToHrs(total.hours) }}</th>
      </tr>
      </table>
    </div>
</template>

<script>
import api from '../services/api'

export default {

  data() {
    return {
      projectId: this.$route.query.project,
      project: {},
      userId: this.$route.query.user,
      user: {},
      data: [],
      total: { hours: 0 },
    }
  },

  methods: {
    getDescendants(taskId, tasks) {
      const result = [taskId]
      const findChildren = taskId => {
        for (const task of tasks) {
          if (task.parent_id == taskId) {
            result.push(task.id)
            if (!task.is_leaf) {
              findChildren(task.id)
            }
          }
        }
      }
      findChildren(taskId)
      return result
    }
  },

  async mounted() {
    if (api.user.hasRole('reporting')) {
      try {
        let response = await api.get(`/task/${this.projectId}`)
        this.project = response.data
        if (this.userId > 0) {
          response = await api.get(`/user/${this.userId}`)
          this.user = response.data
        }
        response = await api.get(`/task/${this.projectId}/descendants?format=extended`)
        const tasks = response.data
        tasks.push({id: this.project.id, path: this.project.name, is_leaf: this.project.is_leaf})
        for (const task of tasks) {
          const descendants = this.getDescendants(task.id, tasks)
          const taskFilter = `?filter[task_id][in]=${descendants.join(',')}`
          const userFilter = this.userId > 0 ? `&filter[user_id][eq]=${this.userId}` : ''
          const url = `/timelog/sum${taskFilter}${userFilter}`
          response = await api.get(url)
          task.hours = response.data.duration
        }
        this.total = tasks.pop()
        this.data = tasks.filter(t => t.hours > 0)
      } catch(e) {
        console.error(e)
      }
    }
  }

}
</script>

<style scoped>
  @import '../assets/reports.css';
  .highlight {
    font-weight: 700
  }
</style>