import Vue from 'vue'
import VueRouter from 'vue-router'
import reports from '../reports'
import _ from 'lodash'

Vue.use(VueRouter)
  const reportRoutes = reports.map(route => {
    return {
      path: `/reports/${route.value}`,
      component: () => import(`../reports/${_.upperFirst(_.camelCase(route.value))}`)
    }
  })
  const routes = [{
    path: '/',
    component: () => import('../views/Dashboard.vue')
  }, {
    path: '/login',
    component: () => import('../views/Login.vue')
  }, {
    path: '/password',
    component: () => import('../views/Password.vue')
  }, {
    path: '/time-sheet/:date(\\d\\d\\d\\d-\\d\\d-\\d\\d)?',
    component: () => import('../views/TimeSheet.vue')
  }, {
    path: '/weekly-overview',
    component: () => import('../views/TimeSheetWeekly.vue')
  }, {
    path: '/monthly-overview',
    component: () => import('../views/TimeSheetMonthly.vue')
  }, {
    path: '/todo',
    component: () => import('../views/TodoList.vue')
  }, {
    path: '/todo/:id(new|\\d+)',
    component: () => import('../views/TaskDetails.vue')
  }, {
    path: '/contacts',
    component: () => import('../views/ContactList.vue')
  }, {
    path: '/contacts/:id(new|\\d+)',
    component: () => import('../views/ContactDetails.vue')
  }, {
    path: '/organisations',
    component: () => import('../views/OrganisationList.vue')
  }, {
    path: '/organisations/:id(new|\\d+)',
    component: () => import('../views/OrganisationDetails.vue')
  }, {
    path: '/reporting',
    component: () => import('../views/Reporting.vue')
  }, {
    path: '/invoices',
    component: () => import('../views/InvoiceList.vue')
  }, {
    path: '/invoices/:id(new|\\d+)',
    component: () => import('../views/InvoiceDetails.vue')
  }, {
    path: '/customers',
    component: () => import('../views/CustomerList.vue')
  }, {
    path: '/customers/:id(new|\\d+)',
    component: () => import('../views/CustomerDetails.vue')
  }, {
    path: '/users',
    component: () => import('../views/UserList.vue')
  }, {
    path: '/users/:id(new|\\d+)',
    component: () => import('../views/UserDetails.vue')
  }, {
    path: '/projects',
    component: () => import('../views/Projects.vue')
  },
  ...reportRoutes, {
    path: '/reports/invoice/:id(new|\\d+)',
    component: () => import('../reports/Invoice.vue')
  }, {
    path: '/*',
    component: Vue.component('empty')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
