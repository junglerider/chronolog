<template>
  <div v-if="user.hasRole('admin')">
    <v-container>
      <v-row>
        <v-col md="12">
          <div class="page-title">{{ $i18n('Projects & Tasks') }}</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6" class="col-xs-12 form-col">
          <v-treeview
            ref="treeview"
            :key="treeversion"
            :items="items"
            item-value="id"
            item-title="name"
            item-children="children"
            :activated="active"
            v-model:opened="open"
            :load-children="fetchProjects"
            activatable
            color="info"
            @update:activated="onActivate"
          >
            <template v-slot:prepend="{ item }">
              <v-icon v-if="item.is_leaf" :style="itemStyle(item, false)" @contextmenu="e => showMenu(item, e)">
                {{ 'mdi-hammer-wrench' }}
              </v-icon>
              <v-icon v-else :style="itemStyle(item, false)" @contextmenu="e => showMenu(item, e)">
                {{ open.includes(item.id) ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
            </template>
            <template v-slot:title="{ item }">
              <span
                :style="itemStyle(item)"
                :draggable="item.id != 'NULL'"
                @dragstart="onDragStart(item, $event)"
                @dragover.prevent
                @drop.prevent="onDrop(item)"
                @contextmenu="e => showMenu(item, e)"
              >{{ item.name }}</span>
            </template>
          </v-treeview>
        </v-col>
        <v-col cols="12" sm="6" class="col-xs-12 form-col">
          <div class="active-project" v-if="active.length" style="position: fixed">
            <div>
              <v-icon v-if="activated.is_leaf" :style="itemStyle(activated, false)" class="mr-2">
                mdi-hammer-wrench
              </v-icon>
              <v-icon v-else :style="itemStyle(activated, false)" class="mr-2">
                mdi-folder
              </v-icon>
              <span :style="itemStyle(activated)">{{ $i18n(itemType(activated)) }}</span>
              <v-btn icon @click="e => showMenu(activated, e)" class="ml-1" variant="text">
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </div>
            <div>{{ $i18n('Name') }}: {{ activated.name }}</div>
            <div>{{ $i18n('ID') }}: {{ activated.id }}</div>
            <div v-if="activated.description">{{ $i18n('Description') }}: {{ activated.description }}</div>
            <div>{{ $i18n('Parent project') }}: {{ $i18n(activated.parent_name ? activated.parent_name : 'Projects') }}</div>
            <div>{{ $i18n('Assigned to') }}: {{ $i18n(activated.user_name ? activated.user_name : 'all') }}</div>
            <div>{{ $i18n('Customer') }}: {{ activated.customer_name }}</div>
            <div v-if="activated.is_leaf">{{ $i18n('Total hours') }}: {{ $i18nDecToHrs(activated.duration) }}</div>
            <div v-else-if="activated.id != 'NULL'">
              {{ $i18n('Total hours') }}:
              <span v-if="activated.duration">
                {{ $i18nDecToHrs(activated.duration) }}
              </span>
              <span v-else>
                <a @click="calculateHours">{{ $i18n('Calculate') }}</a>
              </span>
              </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar timeout="1500" :color="messageColor" v-model="message" location="top" variant="tonal">
      <v-icon v-if="messageColor == 'info'" color="blue">mdi-alert-outline</v-icon>
      {{ messageText }}
    </v-snackbar>
    <v-menu v-model="menuOpen" :target="menuCoord">
      <v-list>
        <v-list-item v-if="activated.id !== 'NULL'" class="squeeze">
          <div>
            <v-list-item-title @click.stop="menuOpen = false; dialog = true">{{ $i18n('Edit') }}</v-list-item-title>
          </div>
        </v-list-item>
        <v-list-item class="squeeze">
          <div>
              <v-list-item-title @click="beginInsert()">{{ $i18n('Insert child task') }}</v-list-item-title>
          </div>
        </v-list-item>
        <v-list-item v-if="activated.is_leaf && activated.duration == 0 && activated.id !== 'NULL'" class="squeeze">
          <div>
              <v-list-item-title @click.stop="deleteProject()">{{ $i18n('Delete') }}</v-list-item-title>
          </div>
        </v-list-item>
        <v-list-item v-if="!activated.is_closed && activated.id !== 'NULL'" @click.stop="updateTree({is_closed: 1})" class="squeeze">
          <div>
              <v-list-item-title>{{ $i18n('Close') }}</v-list-item-title>
          </div>
        </v-list-item>
        <v-list-item v-if="activated.is_closed && activated.id !== 'NULL'" @click.stop="updateTree({is_closed: 0})" class="squeeze">
          <div>
              <v-list-item-title>{{ $i18n('Reopen') }}</v-list-item-title>
          </div>
        </v-list-item>
        <v-list-item v-if="!activated.is_closed && activated.is_active && activated.id !== 'NULL'" @click.stop="updateTree({is_active: 0})" class="squeeze">
          <div>
              <v-list-item-title>{{ $i18n('Deactivate') }}</v-list-item-title>
          </div>
        </v-list-item>
        <v-list-item v-if="!activated.is_closed && !activated.is_active && activated.id !== 'NULL'" @click.stop="updateTree({is_active: 1})" class="squeeze">
          <div>
              <v-list-item-title>{{ $i18n('Activate') }}</v-list-item-title>
          </div>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog v-model="dialog" max-width="70%">
      <v-card>
        <v-card-text>
          <task-edit :task="activated" mode="admin" @task-edit-event="onTaskEdit" ref="taskEditor" :key="'taskedit' + taskversion"></task-edit>
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
  cursor: pointer;
}
</style>

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
      projects: [],
      active: [],
      draggedProjectId: null,
      activated: {},
      open: [],
      treeversion: 1,
      taskversion: 1,
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
        this.active = []
        this.activated = {}
      } else if (event == 'saveOK') {
        this.dialog = false
        this.taskversion++
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
    beginInsert() {
      const parentProject = this.findProjectInTree(this.activated.id, this.items[0])
      this.activated = {
        id: 'new',
        is_active: 1,
        is_leaf: 1,
        is_closed: 0,
        parent_id: this.activated.id == 'NULL' ? null : this.activated.id,
        customer_id: this.activated.customer_id,
        customer_name: this.activated.customer_name,
        user_id: this.activated.user_id,
        duration: 0,
        _parent_object: parentProject
      }
      this.menuOpen = false
      this.dialog = true
      setTimeout(() => this.$refs.taskEditor.$refs.nameInput.focus(), 500)
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
    async updateProject(project) {
      try {
        await api.put(`/task/${project.id}`, api.nullIt(project))
      } catch (err) {
        console.error(err)
        this.showMessage('Saving did not succeed.', 'error')
      }
    },
    async updateTree(data) {
      const project = this.findProjectInTree(this.activated.id, this.items[0])
      const treeUpdate = project => {
        if (data.is_closed !== undefined) {
          project.is_closed = data.is_closed
        }
        if (data.is_active !== undefined) {
          project.is_active = data.is_active
        }
        if (project.children) {
          for (const child of project.children) {
            treeUpdate(child)
          }
        }
      }
      try {
        await api.put(`/task/${project.id}/descendants`, api.nullIt(data))
        treeUpdate(project)
        this.treeversion += 1
        this.showMessage('OK - Saved!')
      } catch (err) {
        console.error(err)
        this.showMessage('Saving did not succeed.', 'error')
      }
      this.menuOpen = false
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
          this.showMessage('Deletion did not succeed.', 'error')
          console.error(err)
        }
      }
      this.menuOpen = false
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
      if (update) {
        project.parent_id = parentProject.id == 'NULL' ? null : parentProject.id
        await this.updateProject(project)
      }
      if (parentProject.is_leaf) {
        parentProject.is_leaf = 0
        parentProject.children = []
        await this.updateProject(parentProject)
        parentProject.children.push(project)
        if (this.open.indexOf(parentProject.id) < 0) {
          this.open.push(parentProject.id)
        }
        this.treeversion += 1
        return
      }
      if (this.open.indexOf(parentProject.id) >= 0 && !parentProject.children.find(p => p.id == project.id)) {
        parentProject.children.push(project)
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
    onDragStart(item, event) {
      this.draggedProjectId = item.id
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(item.id))
    },
    onDrop(target) {
      if (this.draggedProjectId !== null) {
        const draggedProjectId = this.draggedProjectId
        this.draggedProjectId = null
        return this.moveProject(draggedProjectId, target.id)
      }
    },
    async moveProject(draggedProjectId, targetProjectId) {
      const rootProject = this.items[0]
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
        alert(this.$i18n('Cannot move project to descendant.'))
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
    onActivate(ids) {
      this.active = ids
      return this.showProjectDetails()
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
    async calculateHours() {
      try {
        let response = await api.get(`/task/${this.activated.id}/descendants`)
        const projectIds = response.data
        projectIds.unshift(Number(this.activated.id))
        response = await api.get(`/timelog/sum?filter[task_id][in]=${projectIds.join(',')}`)
        this.activated.duration = Number(response.data.duration)
      } catch(err) {
        console.error(err)
      }
    }
  },

  async mounted() {
    await this.fetchProjects(this.items[0])
    this.open.push('NULL')
  }
}
</script>