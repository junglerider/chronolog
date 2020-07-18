import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8888'
})

api.getCount = async (entity, filter = '') => {
  let url = entity + '/count'
  if(filter && filter.length) {
    url = `${url}?${filter}`
  }
  const response = await api.get(url)
  return response.data.count
}

api.getList = async (entity, options, filter = '') => {
  const offset = options.itemsPerPage * (options.page - 1)
  const sortDirection = options.sortDesc[0] ? 'desc' : 'asc'
  const sortClause = options.sortBy[0] ? `&order=${options.sortBy[0]}:${sortDirection}` : ''
  const response = await api.get(`${entity}?offset=${offset}&limit=${options.itemsPerPage}${sortClause}${filter}`)
  return response.data
}

export default api

export const nullIt = object => {
  const nulledObject = {}
  for (let [key, value] of Object.entries(object)) {
    nulledObject[key] = (value === '' || value === undefined)? null : value
  }
  return nulledObject
}

export const undefineIt = object => {
  const undefinedObject = {}
  for (let [key, value] of Object.entries(object)) {
    undefinedObject[key] = (value === null)? undefined : value
  }
  return undefinedObject
}
