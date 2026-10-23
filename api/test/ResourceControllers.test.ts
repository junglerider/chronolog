import { MockDatabase } from './MockDatabase'
import { createMockLogger } from './MockLogger'
import { UserSession } from '../src/UserSession'
import { Contact } from '../src/resources/Contact'
import { Customer } from '../src/resources/Customer'
import { Employee } from '../src/resources/Employee'
import { Invoice } from '../src/resources/Invoice'
import { InvoiceItem } from '../src/resources/InvoiceItem'
import { Organisation } from '../src/resources/Organisation'
import { Person } from '../src/resources/Person'
import { Setting } from '../src/resources/Setting'
import { Task } from '../src/resources/Task'
import { TimeClock } from '../src/resources/TimeClock'
import { TimeLog } from '../src/resources/TimeLog'
import { TimeLogReport } from '../src/resources/TimeLogReport'
import { User } from '../src/resources/User'

const makeSession = (roles = ['admin'], id = 1) =>
  new UserSession ({ time: Date.now (), id, username: 'test', name: 'Test User', roles, password_empty: false })

const makeDatabase = () => new MockDatabase ({
  error: new Error ('database failure'),
  callSucceeds: true,
  runResult: { lastID: 111, changes: 1 },
  getResult: { id: 1 },
  allResult: [{ id: 1 }]
})

async function invoke (controller: any, method: string, overrides: any = {}) {
  const req = {
    method: 'GET',
    body: {},
    params: { id: '1', userId: '1', user_id: '1', date: '2026-10-20', key: 'app' },
    query: {},
    session: makeSession (),
    ...overrides
  }
  const res = { status: jest.fn ().mockReturnThis (), json: jest.fn ().mockReturnThis () }
  const next = jest.fn ()
  await controller[method] (req, res, next)
  return { req, res, next }
}

describe ('resource controller contracts', () => {
  let db
  let logger

  beforeEach (() => {
    db = makeDatabase ()
    logger = createMockLogger ()
  })

  test ('Contact lists entity contacts and validates access and required fields', async () => {
    const resource = new Contact (db, logger)
    const result = await invoke (resource, 'listByEntity', { params: { id: '7' } })
    expect (result.res.json).toHaveBeenCalledWith ([{ id: 1 }])
    expect (db.all).toHaveBeenCalledWith ('SELECT id, type, entry FROM contact WHERE entity_id = ?', ['7'])
    expect (result.next).toHaveBeenCalledWith ()

    resource.validateCreate ({ body: { entity_id: 1, entry: 'test', type: 'email' } } as any)
    for (const body of [{}, { entity_id: 1 }, { entity_id: 1, entry: 'test' }]) {
      expect (() => resource.validateCreate ({ body } as any)).toThrow (/required/)
    }
    expect (() => resource.validateAccess ({ session: makeSession ([]) } as any)).toThrow ('403:No contacts credentials')
    resource.validateAccess ({ session: makeSession (['contacts']) } as any)

    db.all.mockRejectedValueOnce (new Error ('query failed'))
    const failed = await invoke (resource, 'listByEntity')
    expect (failed.next).toHaveBeenCalledWith (expect.objectContaining ({ message: 'query failed' }))
  })

  test ('Customer list, task count, read, validation, and invoicing access are covered', async () => {
    const resource = new Customer (db, logger)
    for (const method of ['list', 'taskCount', 'read']) {
      const result = await invoke (resource, method)
      expect (result.next).toHaveBeenCalledWith ()
      expect (result.res.json).toHaveBeenCalled()
    }
    resource.validateCreate ({ body: { name: 'Customer', organisation_id: 2 } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/name is required/)
    expect (() => resource.validateCreate ({ body: { name: 'Customer' } } as any)).toThrow (/organisation_id is required/)
    expect (() => resource.validateAccess ({ method: 'POST', session: makeSession ([]) } as any)).toThrow ('403:No invoicing credentials')
    resource.validateAccess ({ method: 'GET', session: makeSession ([]) } as any)
    resource.validateAccess ({ method: 'POST', session: makeSession (['invoicing']) } as any)

    db.all.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'taskCount')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('Employee validates required fields and contacts access', () => {
    const resource = new Employee (db, logger)
    resource.validateCreate ({ body: { organisation_id: 1, person_id: 2 } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/organisation id is required/)
    expect (() => resource.validateCreate ({ body: { organisation_id: 1 } } as any)).toThrow (/person id is required/)
    resource.validateAccess ({ session: makeSession (['contacts']) } as any)
    expect (() => resource.validateAccess ({ session: makeSession ([]) } as any)).toThrow ('403:No contacts credentials')
  })

  test ('Organisation covers joined reads and transactional create, update, and delete', async () => {
    const resource = new Organisation (db, logger)
    for (const method of ['list', 'count', 'read', 'getPersons']) {
      const result = await invoke (resource, method)
      expect (result.next).toHaveBeenCalledWith ()
    }
    expect ((await invoke (resource, 'list', { session: makeSession ([]) })).next)
      .toHaveBeenCalledWith (expect.objectContaining ({ message: '403:No contacts credentials' }))

    let result = await invoke (resource, 'create', { method: 'POST', body: {} })
    expect (result.res.status).toHaveBeenCalledWith (400)
    result = await invoke (resource, 'create', { method: 'POST', body: { name: 'Acme', city: 'Berlin' } })
    expect (result.res.status).toHaveBeenCalledWith (201)
    expect (result.res.json).toHaveBeenCalledWith ({ id: 111 })

    result = await invoke (resource, 'update', {
      method: 'PUT', params: { id: '1' }, body: { name: 'Updated', city: 'Paris' }
    })
    expect (result.res.status).toHaveBeenCalledWith (204)
    result = await invoke (resource, 'update', { method: 'PUT', params: { id: '1' }, body: {} })
    expect (result.res.status).toHaveBeenCalledWith (400)
    db.behaviour.runResult = { lastID: 0, changes: 0 }
    result = await invoke (resource, 'update', { method: 'PUT', params: { id: '1' }, body: { city: 'Paris' } })
    expect (result.res.status).toHaveBeenCalledWith (404)
    db.behaviour.runResult = { lastID: 111, changes: 1 }

    expect ((await invoke (resource, 'delete', { method: 'DELETE' })).res.status).toHaveBeenCalledWith (204)
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'delete', { method: 'DELETE' })).res.status).toHaveBeenCalledWith (404)
    db.behaviour.getResult = { id: 1 }
    expect ((await invoke (resource, 'read')).res.status).toHaveBeenCalledWith (200)
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'read')).res.status).toHaveBeenCalledWith (404)

    db.run.mockReset ()
    db.run.mockResolvedValueOnce ({ lastID: 1, changes: 1 })
      .mockResolvedValueOnce ({ lastID: 0, changes: 0 })
      .mockResolvedValueOnce ({ lastID: 1, changes: 1 })
    const failed = await invoke (resource, 'create', { method: 'POST', body: { name: 'Fail' } })
    expect (failed.next).toHaveBeenCalledWith (expect.objectContaining ({ message: 'Could not create organisation entity' }))
  })

  test ('Person covers joined reads and transactional create, update, and delete', async () => {
    const resource = new Person (db, logger)
    for (const method of ['list', 'count', 'read', 'getOrganisations']) {
      expect ((await invoke (resource, method)).next).toHaveBeenCalledWith ()
    }
    expect ((await invoke (resource, 'read', { session: makeSession ([]) })).next)
      .toHaveBeenCalledWith (expect.objectContaining ({ message: '403:No contacts credentials' }))

    let result = await invoke (resource, 'create', { method: 'POST', body: {} })
    expect (result.res.status).toHaveBeenCalledWith (400)
    result = await invoke (resource, 'create', {
      method: 'POST', body: { first_name: 'Alex', city: 'Berlin' }
    })
    expect (result.res.status).toHaveBeenCalledWith (201)
    expect (result.res.json).toHaveBeenCalledWith ({ id: 111 })

    result = await invoke (resource, 'update', {
      method: 'PUT', params: { id: '1' }, body: { first_name: 'New', city: 'Paris' }
    })
    expect (result.res.status).toHaveBeenCalledWith (204)
    result = await invoke (resource, 'update', { method: 'PUT', params: { id: '1' }, body: {} })
    expect (result.res.status).toHaveBeenCalledWith (400)
    db.behaviour.runResult = { lastID: 0, changes: 0 }
    result = await invoke (resource, 'update', { method: 'PUT', params: { id: '1' }, body: { city: 'Paris' } })
    expect (result.res.status).toHaveBeenCalledWith (404)
    db.behaviour.runResult = { lastID: 111, changes: 1 }

    expect ((await invoke (resource, 'delete', { method: 'DELETE' })).res.status).toHaveBeenCalledWith (204)
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'delete', { method: 'DELETE' })).res.status).toHaveBeenCalledWith (404)
    db.behaviour.getResult = { id: 1 }

    db.run.mockReset ()
    db.run.mockResolvedValueOnce ({ lastID: 1, changes: 1 })
      .mockResolvedValueOnce ({ lastID: 0, changes: 0 })
      .mockResolvedValueOnce ({ lastID: 1, changes: 1 })
    const failed = await invoke (resource, 'create', { method: 'POST', body: { last_name: 'Fail' } })
    expect (failed.next).toHaveBeenCalledWith (expect.objectContaining ({ message: 'Could not create person entity' }))
  })

  test ('Invoice reads and lists invoices, validates fields, and enforces invoicing access', async () => {
    const resource = new Invoice (db, logger)
    for (const method of ['list', 'read']) {
      const result = await invoke (resource, method)
      expect (result.next).toHaveBeenCalledWith ()
      expect (result.res.json).toHaveBeenCalled()
    }
    const invoice = {
      invoice_no: 'INV-1', customer_id: 2, status: 'draft', date: '2026-10-20',
      due_date: '2026-11-20', address: 'Street', currency: 'EUR'
    }
    resource.validateCreate ({ body: invoice } as any)
    for (const key of Object.keys (invoice)) {
      const invalid = { ...invoice, [key]: '' }
      expect (() => resource.validateCreate ({ body: invalid } as any)).toThrow (/required/)
    }
    resource.validateAccess ({ session: makeSession (['invoicing']) } as any)
    expect (() => resource.validateAccess ({ session: makeSession ([]) } as any)).toThrow ('403:No invoicing credentials')
    db.get.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'read')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('Invoice items support item retrieval and validate invoicing access', async () => {
    const resource = new InvoiceItem (db, logger)
    for (const method of ['list', 'items']) {
      const result = await invoke (resource, method)
      expect (result.next).toHaveBeenCalledWith ()
      expect (result.res.json).toHaveBeenCalled()
    }
    resource.validateCreate ({ body: { invoice_id: 1 } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/invoice_id is required/)
    resource.validateAccess ({ session: makeSession (['invoicing']) } as any)
    expect (() => resource.validateAccess ({ session: makeSession ([]) } as any)).toThrow ('403:No invoicing credentials')
    db.all.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'items')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('Setting reads key prefixes, validates access, and requires a key on creation', async () => {
    const resource = new Setting (db, logger)
    const prefixed = await invoke (resource, 'readMany', { params: { key: 'report%' } })
    expect (db.all).toHaveBeenCalledWith ('SELECT * FROM setting WHERE key LIKE ?', ['report%'])
    expect (prefixed.res.status).toHaveBeenCalledWith (200)
    await invoke (resource, 'readMany', { params: { key: 'report' } })
    expect (db.all).toHaveBeenLastCalledWith ('SELECT * FROM setting WHERE key LIKE ?', ['report%'])
    resource.validateCreate ({ body: { key: 'theme' } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/key is required/)
    resource.validateAccess ({ session: makeSession () } as any)
    expect (() => resource.validateAccess ({ session: makeSession ([]) } as any)).toThrow ('403:No admin credentials')
    db.all.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'readMany')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('Time log reports return rows and forward database errors', async () => {
    const resource = new TimeLogReport (db, logger)
    const result = await invoke (resource, 'list', { query: { filter: { user_id: '1' } } })
    expect (result.res.status).toHaveBeenCalledWith (200)
    expect (result.res.json).toHaveBeenCalledWith ([{ id: 1 }])
    db.all.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'list')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('User list and read map password state and enforce administrator access', async () => {
    const resource = new User (db, logger)
    const listed = await invoke (resource, 'list')
    expect (listed.res.json).toHaveBeenCalledWith ([{ id: 1 }])

    const read = await invoke (resource, 'read')
    expect (read.res.status).toHaveBeenCalledWith (200)
    expect (read.res.json).toHaveBeenCalledWith ({ id: 1, password: 0 })
    db.behaviour.getResult = { id: 1, password: 'hash' }
    expect ((await invoke (resource, 'read')).res.json).toHaveBeenCalledWith ({ id: 1, password: 1 })
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'read')).res.status).toHaveBeenCalledWith (404)
    const forbidden = await invoke (resource, 'read', { session: makeSession ([]) })
    expect (forbidden.next).toHaveBeenCalledWith (expect.objectContaining ({ message: '403:No admin credentials' }))

    resource.validateCreate ({ body: { login: 'test', person_id: 1 } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/login name is required/)
    expect (() => resource.validateCreate ({ body: { login: 'test' } } as any)).toThrow (/person_id is required/)
    resource.validateAccess ({ method: 'GET', params: { user_id: '2' }, session: makeSession ([]) } as any)
    expect (() => resource.validateAccess ({ method: 'PUT', session: makeSession ([]) } as any)).toThrow ('403:No admin credentials')
  })

  test ('Time clock covers list, read, update, delete, validation, and owner access', async () => {
    const resource = new TimeClock (db, logger)
    for (const method of ['list', 'read']) {
      const result = await invoke (resource, method)
      expect (result.next).toHaveBeenCalledWith ()
    }

    let result = await invoke (resource, 'update', { method: 'PUT', body: { work_duration: 8 } })
    expect (result.res.status).toHaveBeenCalledWith (204)
    result = await invoke (resource, 'update', { method: 'PUT', body: {} })
    expect (result.res.status).toHaveBeenCalledWith (400)
    db.behaviour.runResult = { lastID: 0, changes: 0 }
    result = await invoke (resource, 'update', { method: 'PUT', body: { work_duration: 8 } })
    expect (result.res.status).toHaveBeenCalledWith (404)
    db.behaviour.runResult = { lastID: 1, changes: 1 }
    expect ((await invoke (resource, 'delete', { method: 'DELETE' })).res.status).toHaveBeenCalledWith (204)
    db.behaviour.runResult = { lastID: 0, changes: 0 }
    expect ((await invoke (resource, 'delete', { method: 'DELETE' })).res.status).toHaveBeenCalledWith (404)

    resource.validateCreate ({ body: { date: '2026-10-20', user_id: 1 } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/date is required/)
    expect (() => resource.validateCreate ({ body: { date: '2026-10-20' } } as any)).toThrow (/user_id is required/)
    resource.validateAccess ({ method: 'GET', params: { user_id: '2' }, session: makeSession ([]) } as any)
    resource.validateAccess ({ method: 'PUT', params: { user_id: '2' }, session: makeSession () } as any)
    resource.validateAccess ({ method: 'PUT', params: { user_id: '1' }, session: makeSession ([], 1) } as any)
    resource.validateAccess ({
      method: 'POST', params: { user_id: '2' }, body: { user_id: 1 }, session: makeSession ([], 1)
    } as any)
    expect (() => resource.validateAccess ({ method: 'DELETE', params: { user_id: '2' }, session: makeSession ([], 1) } as any)).toThrow ('403:Insufficient credentials')
    expect ((await invoke (resource, 'read', { params: { user_id: '2', date: '2026-10-20' } })).next).toHaveBeenCalledWith ()
    db.get.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'read')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('Time log list, summaries, create validation, and record permissions are covered', async () => {
    const resource = new TimeLog (db, logger)
    for (const method of ['list', 'daily']) {
      expect ((await invoke (resource, method)).res.json).toHaveBeenCalled()
    }
    db.behaviour.getResult = { duration: null }
    expect ((await invoke (resource, 'sum')).res.json).toHaveBeenCalledWith ({ duration: 0 })
    db.behaviour.getResult = { duration: 4.5 }
    expect ((await invoke (resource, 'sum')).res.json).toHaveBeenCalledWith ({ duration: 4.5 })
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'sum')).res.status).toHaveBeenCalledWith (404)
    db.behaviour.getResult = { user_id: 1 }
    resource.validateCreate ({ body: { date: '2026-10-20', task_id: 1, user_id: 1 } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/date is required/)
    expect (() => resource.validateCreate ({ body: { date: '2026-10-20' } } as any)).toThrow (/task_id is required/)
    expect (() => resource.validateCreate ({ body: { date: '2026-10-20', task_id: 1 } } as any)).toThrow (/user_id is required/)

    await resource.validateAccess ({ method: 'GET', session: makeSession ([]) } as any)
    await resource.validateAccess ({ method: 'POST', body: { user_id: 1 }, session: makeSession ([], 1) } as any)
    await resource.validateAccess ({ method: 'PUT', body: { user_id: 1 }, session: makeSession ([], 1) } as any)
    await resource.validateAccess ({ method: 'DELETE', params: { id: '5' }, session: makeSession ([], 1) } as any)
    expect (db.get).toHaveBeenCalledWith ('SELECT * FROM time_log WHERE id = ?', ['5'])
    await expect (resource.validateAccess ({ method: 'DELETE', params: { id: '5' }, session: makeSession ([], 2) } as any)).rejects.toThrow ('403:Insufficient credentials')
    await expect (resource.validateAccess ({ method: 'POST', body: { user_id: 2 }, session: makeSession ([], 1) } as any)).rejects.toThrow ('403:Insufficient credentials')
    await resource.validateAccess ({ method: 'POST', body: { user_id: 2 }, session: makeSession () } as any)

    db.all.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'list')).next).toHaveBeenCalledWith (expect.any (Error))
  })

  test ('Task covers list formats, todo queries, descendants, and updates', async () => {
    db.behaviour.allResult = []
    const resource = new Task (db, logger)
    for (const query of [{}, { format: 'extended', order: 'name:asc' }]) {
      expect ((await invoke (resource, 'list', { query })).res.json).toHaveBeenCalledWith ([])
    }
    for (const method of ['todoList', 'projectList', 'projects']) {
      expect ((await invoke (resource, method)).next).toHaveBeenCalledWith ()
    }
    expect ((await invoke (resource, 'todoCount')).res.status).toHaveBeenCalledWith (200)
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'todoCount')).res.status).toHaveBeenCalledWith (404)
    db.behaviour.getResult = { id: 1, name: 'Root' }
    expect ((await invoke (resource, 'read')).res.status).toHaveBeenCalledWith (200)
    db.behaviour.getResult = null
    expect ((await invoke (resource, 'read')).res.status).toHaveBeenCalledWith (404)
    resource.validateCreate ({ body: { name: 'Task' } } as any)
    expect (() => resource.validateCreate ({ body: {} } as any)).toThrow (/name is required/)

    db.all.mockImplementation (async (_sql, params) => {
      if (params[0] === '1' && _sql.includes ('AND t.is_leaf = 0')) {
        return [{ id: 2, name: 'Project', is_leaf: 0 }]
      }
      if (params[0] === '1') return [{ id: 2, name: 'Project', is_leaf: 0 }, { id: 3, name: 'Task', is_leaf: 1 }]
      if (params[0] === 2 && _sql.includes ('AND t.is_leaf = 0')) return []
      if (params[0] === 2) return [{ id: 4, name: 'Child', is_leaf: 1 }]
      return []
    })
    db.behaviour.getResult = { name: 'Root' }
    const extended = await invoke (resource, 'descendants', {
      params: { id: '1' },
      query: { format: 'extended', type: 'project' }
    })
    expect (extended.res.json).toHaveBeenCalledWith ([
      { id: 2, parent_id: '1', is_leaf: 0, path: 'Root/Project' }
    ])
    db.behaviour.getResult = null
    const ids = await invoke (resource, 'descendants', { params: { id: '1' }, query: { type: 'task' } })
    expect (ids.res.json).toHaveBeenCalledWith ([4, 3])

    db.all.mockImplementation (async () => [])
    let update = await invoke (resource, 'updateDescendants', { params: { id: '1' }, body: {} })
    expect (update.res.status).toHaveBeenCalledWith (400)
    update = await invoke (resource, 'updateDescendants', { params: { id: '1' }, body: { name: 'Updated' } })
    expect (update.res.status).toHaveBeenCalledWith (204)
    db.all.mockRejectedValueOnce (new Error ('query failed'))
    expect ((await invoke (resource, 'projects')).next).toHaveBeenCalledWith (expect.any (Error))
  })
})
