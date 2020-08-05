import Vue from 'vue'
import VueRouter from 'vue-router'
import UnderConstruction from '../views/UnderConstruction'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/timesheet/:date(\\d\\d\\d\\d-\\d\\d-\\d\\d)?',
    name: 'Timesheet',
    component: () => import('../views/TimeSheet.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue')
  },
  {
    path: '/todo',
    name: 'TodoList',
    component: () => import('../views/TodoList.vue')
  },
  {
    path: '/todo/:id(new|\\d+)',
    name: 'TodoDetails',
    component: () => import('../views/TaskDetails.vue')
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('../views/ContactList.vue')
  },
  {
    path: '/contacts/:id(new|\\d+)',
    name: 'ContactDetails',
    component: () => import('../views/ContactDetails.vue')
  },
  {
    path: '/organisations',
    name: 'Organisations',
    component: () => import('../views/OrganisationList.vue')
  },
  {
    path: '/organisations/:id(new|\\d+)',
    name: 'OrganisationDetails',
    component: () => import('../views/OrganisationDetails.vue')
  },
  {
    path: '/*',
    name: 'anything',
    component: UnderConstruction
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
