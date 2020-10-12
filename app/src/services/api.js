import axios from 'axios'

const baseURL = process && process.env && process.env.NODE_ENV === 'development' ?
  'http://localhost:8888' :
  `${location.protocol}//${location.host}`

const api = axios.create({ baseURL: baseURL + '/api' })

// add authorization header
api.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('token')
  return config
}, error => {
  return Promise.reject(error)
})

// redirect to login page if not authorised
api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response.status == 401) {
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

const hasRole = role => userApi.user.roles.includes('admin') || userApi.user.roles.includes(role)

const userApi = {

  request: (...args) => api.request(...args),
  get: (...args) => api.get(...args),
  post: (...args) => api.post(...args),
  put: (...args) => api.put(...args),
  patch: (...args) => api.patch(...args),
  delete: (...args) => api.delete(...args),
  head: (...args) => api.head(...args),
  options: (...args) => api.options(...args),

  getCount: async (entity, filter = '') => {
    let url = entity + '/count'
    if (filter && filter.length) {
      url = `${url}?${filter}`
    }
    const response = await api.get(url)
    return response.data.count
  },

  getList: async (entity, options, filter = '') => {
    const offset = options.itemsPerPage * (options.page - 1)
    const sortDirection = options.sortDesc[0] ? 'desc' : 'asc'
    const sortClause = options.sortBy[0] ? `&order=${options.sortBy[0]}:${sortDirection}` : ''
    const response = await api.get(`${entity}?offset=${offset}&limit=${options.itemsPerPage}${sortClause}${filter}`)
    return response.data
  },

  nullIt: object => {
    const nulledObject = {}
    for (let [key, value] of Object.entries(object)) {
      nulledObject[key] = (value === '' || value === undefined)? null : value
    }
    return nulledObject
  },

  user: { roles: [], hasRole: () => false }, // <--- user session data is stored here

  login: async credentials => {
    try {
      const response = await axios({
        method: 'post',
        url: baseURL + '/auth/login',
        data: credentials,
        headers: {
          Authorization: 'Bearer ' + window.localStorage.getItem('token')
        }
      })
      window.localStorage.setItem('token', response.data.token)
      userApi.user = response.data
      userApi.user.hasRole = hasRole
      return response
    } catch (err) {
      return Promise.reject(err)
    }
  },

  logout: async () => {
    await axios({
      method: 'post',
      url: baseURL + '/auth/logout',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token')
      }
    })
    window.localStorage.removeItem('token')
  },

  reloadSession: async () => {
    if (window.location.pathname !== '/login') {
      try {
        const response = await axios({
          method: 'get',
          url: baseURL + '/auth/session',
          headers: {
            Authorization: 'Bearer ' + window.localStorage.getItem('token')
          }
        })
        userApi.user = response.data
        userApi.user.hasRole = hasRole
      } catch (err) {
        if (err.response.status == 401) {
          window.location.href = '/login'
        } else {
          console.log(err)
        }
      }
    }
  }

}

export default userApi