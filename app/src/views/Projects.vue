<template>
  <div v-if="user.hasRole('admin')">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ 'Projects & Tasks' | i18n }}</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12 col-sm-6 col-xs-12 form-col">
          <v-treeview
            :key="treeversion"
            :items="items"
            :active.sync="active"
            :load-children="fetchProjects"
            :open.sync="open"
            activatable
            color="info"
            transition
            @update:active="showProjectDetails"
          >
            <template v-slot:prepend="{ item, open }">
              <v-icon v-if="item.is_leaf" :style="itemStyle(item, false)" @contextmenu="e => showMenu(item, e)">
                {{ 'mdi-hammer-wrench' }}
              </v-icon>
              <v-icon v-else :style="itemStyle(item, false)" @contextmenu="e => showMenu(item, e)">
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
            </template>
            <template v-slot:label="{ item }">
              <draggable :list="items" group="projects" :id="item.id" @end="dragEnd">
                <span :style="itemStyle(item)" @contextmenu="e => showMenu(item, e)">{{ item.name }}</span>
              </draggable>
            </template>
          </v-treeview>
        </v-col>
        <v-col class="col-12 col-sm-6 col-xs-12 form-col">
          <div class="active-project" v-if="active.length">
            <div>
              <v-icon v-if="activated.is_leaf" :style="itemStyle(activated, false)" class="mr-2">
                mdi-hammer-wrench
              </v-icon>
              <v-icon v-else :style="itemStyle(activated, false)" class="mr-2">
                mdi-folder
              </v-icon>
              <span :style="itemStyle(activated)">{{ itemType(activated) | i18n }}</span>
              <v-btn icon @click="e => showMenu(activated, e)" class="ml-1">
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </div>
            <div>{{ 'Name' | i18n }}: {{ activated.name }}</div>
            <div v-if="activated.description">{{ 'Description' | i18n }}: {{ activated.description }}</div>
            <div>{{ 'Parent project' | i18n }}: {{ activated.parent_name ? activated.parent_name : 'Projects' | i18n }}</div>
            <div>{{ 'Assigned to' | i18n }}: {{ activated.user_name ? activated.user_name : 'all' | i18n }}</div>
            <div>{{ 'Customer' | i18n }}: {{ activated.customer_name }}</div>
            <div>{{ 'Total hours' | i18n }}: {{ $i18nDecToHrs(activated.duration) }}</div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" top text>
      <v-icon v-if="messageColor == 'info'" color="blue">mdi-alert-outline</v-icon>
      {{ messageText }}
    </v-snackbar>
    <v-menu v-model="menuOpen" :position-x="menuCoord[0]" :position-y="menuCoord[1]" offset-y absolute>
      <v-list>
        <v-list-item v-if="activated.id !== 'NULL'" class="squeeze">
          <v-list-item-content>
            <v-list-item-title @click.stop="menuOpen = false; dialog = true">{{ 'Edit' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="squeeze">
          <v-list-item-content>
              <v-list-item-title @click.stop="insertProject">{{ 'Insert child task' | i18n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="activated.is_leaf && activated.duration == 0 && activated.id !== 'NULL'" class="squeeze">
          <v-list-item-content>
              <v-list-item-title @click.stop="deleteProject()">{{ 'Delete' | i18n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!activated.is_closed && activated.id !== 'NULL'" class="squeeze">
          <v-list-item-content>
              <v-list-item-title>{{ 'Close' | i18n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="activated.is_closed && activated.id !== 'NULL'" class="squeeze">
          <v-list-item-content>
              <v-list-item-title>{{ 'Reopen' | i18n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!activated.is_closed && activated.is_active && activated.id !== 'NULL'" class="squeeze">
          <v-list-item-content>
              <v-list-item-title>{{ 'Deactivate' | i18n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!activated.is_closed && !activated.is_active && activated.id !== 'NULL'" class="squeeze">
          <v-list-item-content>
              <v-list-item-title>{{ 'Activate' | i18n }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog v-model="dialog" max-width="70%">
      <v-card>
        <v-card-text>
          <task-edit :task="activated" mode="admin" @task-edit-event="onTaskEdit"></task-edit>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.active-project > div {
  margin-bottom: 6px;
}
.squeeze {
  margin: -12px 0 -1px 0;
  cursor: pointer;
}
</style>

<script>
//import _ from 'lodash'
import api from '../services/api'
import draggable from 'vuedraggable'
import TaskEdit from '../components/TaskEdit'

export default {
  components: {
    draggable,
    TaskEdit
  },

  data() {
    return {
      user: api.user,
      projects: [],
      active: [],
      activated: {},
      open: [],
      treeversion: 1,
      message: false,
      messageColor: 'success',
      messageText: '',
      menuOpen: false,
      menuCoord: [0, 0],
      dialog: false,
    }
  },

  computed: {
    items () {
      return [
        {
          id: 'NULL',
          name: this.$i18n('Projects'),
          is_active: 1,
          is_closed: 0,
          children: this.projects,
          duration: 0,
        },
      ]
    },
  },

  methods: {
    showMessage(text, color='success') {
      this.messageText = this.$i18n(text)
      this.messageColor = color
      this.message = true
    },
    async showMenu(item, event) {
      event.preventDefault()
      this.menuOpen = false
      this.menuCoord = [event.clientX, event.clientY]
      this.active = [item.id]
      await this.showProjectDetails()
      this.menuOpen = true
    },
    itemStyle(item, dimInactive = true) {
      if (item.is_closed || (dimInactive && !item.is_active)) {
        return 'color: #aaa; cursor: default'
      } else {
        return 'cursor: default;'
      }
    },
    itemType(item) {
      let type = item.is_closed ? 'Closed ' : (item.is_active ? 'Active ' : 'Inactive ')
      type += item.is_leaf ? 'task' : 'project'
      return type
    },
    onTaskEdit(event) {
      if (event == 'canceled') {
        this.dialog = false
      } else if (event == 'saveOK') {
        this.dialog = false
        this.showMessage('OK - Saved!')
        this.updateProjectInTree()
      } else if (event == 'noChanges') {
        this.dialog = false
        this.showMessage('No changes were made.', 'info')
      } else if (event == 'customerChanged') {
        this.showMessage('The customer has been changed.', 'info')
      } else if (event == 'saveError') {
        this.showMessage('Saving did not succeed.', 'error')
      } else if (event == 'loadError') {
        this.showMessage('Record could not be loaded.', 'error')
      } else if (event == 'insertOK') {
        this.insertIntoTree(this.activated, this.activated._parent_object, false)
        delete this.activated._parent_object
      }
    },
    fetchProjects(project) {
      return api.get(`/task/projects?filter[parent_id][eq]=${project.id}`)
        .then(response => {
          return response.data.map(task => {
            if (!task.is_leaf) {
              task.children = []
            }
            project.children.push(task)
          })
        })
      .catch(e => {
        console.error(e)
        this.showMessage('Record could not be loaded.', 'error')
      })
    },
    insertProject() {
      const parentProject = this.findProjectInTree(this.activated.id, this.items[0])
      this.activated = {
        id: 'new',
        is_active: 1,
        is_leaf: 1,
        parent_id: this.activated.id == 'NULL' ? null : this.activated.id,
        customer_id: this.activated.customer_id,
        customer_name: this.activated.customer_name,
        user_id: null,
        duration: 0,
        _parent_object: parentProject
      }
      this.menuOpen = false
      this.dialog = true
    },
    async updateProject(project) {
      try {
        await api.put(`/task/${project.id}`, api.nullIt(project))
      } catch (err) {
        console.error(err)
        this.showMessage('Saving did not succeed.', 'error')
      }
    },
    async deleteProject() {
      const project = this.activated
      if (project.is_leaf && project.duration == 0) {
        try {
          await api.delete(`/task/${project.id}`)
          this.showMessage('OK - Deleted!')
          const parentProject = project.parent_id == null ? this.items[0] :
            this.findProjectInTree(project.parent_id, this.items[0])
          this.removeFromTree(project, parentProject)
          this.menuOpen = false
          this.treeversion += 1
        } catch (err) {
          console.error(err)
        }
      }
    },
    // reflect changes to active project in tree
    updateProjectInTree() {
      const project = this.findProjectInTree(this.activated.id, this.items[0])
      if (project) {
        project.name = this.activated.name
        project.is_leaf = this.activated.is_leaf
        project.is_active = this.activated.is_active
        project.is_closed = this.activated.is_closed
      }
    },
    async insertIntoTree(project, parentProject, update = true) {
      if (parentProject.is_leaf) {
        parentProject.children = []
        parentProject.is_leaf = 0
        this.updateProject(parentProject)
      } else  if (this.open.indexOf(parentProject.id) < 0) {
        try {
          await this.fetchProjects(parentProject)
        } catch (err) {
          console.error(err)
        }
      }
      if (!parentProject.children.find(p => p.id == project.id)) {
        parentProject.children.push(project)
      }
      if (update) {
        project.parent_id = parentProject.id
        this.updateProject(project)
      }
      this.treeversion += 1
    },
    removeFromTree(project, parentProject) {
      parentProject.children = parentProject.children.filter(p => p.id != project.id)
      if (parentProject.children.length == 0) {
        parentProject.is_leaf = 1
        delete parentProject.children
        this.updateProject(parentProject)
      }
    },
    findProjectInTree(id, project) {
      if (project.id == id)  return project
      if (project.children) {
        for (let childProject of project.children) {
          let foundProject = this.findProjectInTree(id, childProject)
          if (foundProject) {
            return foundProject
          }
        }
      }
      return undefined
    },
    async dragEnd(event) {
      const rootProject = this.items[0]
      const draggedProjectId = event.srcElement.id
      const targetProjectId = event.to.id
      // dragged root or invalid drop?
      if (draggedProjectId == 'NULL' || draggedProjectId == targetProjectId) {
        return
      }
      const draggedProject = this.findProjectInTree(draggedProjectId, rootProject)
      // target is already parent?
      if (draggedProject.parent_id == targetProjectId || draggedProject.parent_id == null && targetProjectId == 'NULL') {
        return
      }
      // cyclical?
      if (this.findProjectInTree(targetProjectId, draggedProject)) {
        alert(this.$i18n('Cannot move project to descendant project'))
        return
      }
      const oldParentProject = draggedProject.parent_id ?
        this.findProjectInTree(draggedProject.parent_id, rootProject) :
        rootProject
      const newParentProject = this.findProjectInTree(targetProjectId, rootProject)
      if (newParentProject.customer_id !== draggedProject.customer_id) {
        if (!confirm(this.$i18n('The customers are different. Move anyway?'))) {
          return
        }
      }
      this.removeFromTree(draggedProject, oldParentProject)
      this.insertIntoTree(draggedProject, newParentProject)
    },
    async showProjectDetails() {
      if (!this.active.length) {
        this.activated = {}
        return
      }
      if (this.active[0] == 'NULL') {
        this.activated = this.items[0]
        return
      }
      try {
        let response = await api.get(`/task/${this.active[0]}`)
        const activated = response.data
        response = await api.get(`/timelog/sum?filter[task_id]=${this.active[0]}`)
        activated.duration = response.data.duration
        this.activated = activated
      } catch (err) {
        console.error(err)
        this.active = []
        this.activated = {}
      }
    },
  },

  async mounted() {
    await this.fetchProjects(this.items[0])
    this.open.push('NULL')
  }
}
</script>