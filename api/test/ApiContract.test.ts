import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as sqlite3 from 'sqlite3'

describe ('API contracts', () => {
  let app
  let server
  let baseUrl: string
  let databasePath: string
  let adminToken: string
  let regularToken: string
  let apiLogger
  let tempDirectory: string

  const request = (url: string, init: RequestInit = {}) => fetch (`${baseUrl}${url}`, init)
  const json = (body: object, token?: string, method = 'POST'): RequestInit => ({
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify (body)
  })

  beforeAll (async () => {
    tempDirectory = fs.mkdtempSync (path.join (os.tmpdir (), 'chronolog-api-contract-'))
    databasePath = path.join (tempDirectory, 'chronolog.db')
    fs.copyFileSync (path.resolve (__dirname, '../../db/empty.db'), databasePath)

    await new Promise<void> ((resolve, reject) => {
      const db = new sqlite3.Database (databasePath)
      db.serialize (() => {
        db.run ('INSERT INTO entity (id) VALUES (2)')
        db.run ("INSERT INTO person (id, first_name, last_name) VALUES (2, 'Read', 'Only')")
        db.run ("INSERT INTO user (id, person_id, login, password, roles) VALUES (2, 2, 'readonly', NULL, '')")
      })
      db.close (err => err ? reject (err) : resolve ())
    })

    jest.doMock ('../src/config.json', () => ({
      app_name: 'chronolog-api-contract-test',
      port: 0,
      sqlite_db: databasePath,
      db_connection_timeout: 60000,
      session_timeout: 3600000,
      log_level: 'fatal',
      api_rate_limit: 100,
      login_rate_limit: 100
    }))
    const previousCorsOrigins = process.env.CORS_ORIGINS
    process.env.CORS_ORIGINS = 'http://localhost:5403,http://127.0.0.1:5403'
    const module = require ('../src/App')
    app = module.default
    apiLogger = module.logger
    if (previousCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS
    } else {
      process.env.CORS_ORIGINS = previousCorsOrigins
    }
    server = app.app.listen (0)
    await new Promise<void> (resolve => server.once ('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address ().port}`
  })

  afterAll (async () => {
    if (server) {
      await new Promise<void> ((resolve, reject) => server.close (err => err ? reject (err) : resolve ()))
      await app.exit ()
    }
    jest.dontMock ('../src/config.json')
    if (tempDirectory) {
      fs.rmSync (tempDirectory, { recursive: true, force: true })
    }
  })

  test ('reports readiness using the established JSON contract', async () => {
    const response = await request ('/health')

    expect (response.status).toBe (200)
    expect (await response.json ()).toEqual ({
      name: 'Chronolog API server',
      status: 'ready'
    })
  })

  test ('preserves login, session, and logout response contracts', async () => {
    const missingUser = await request ('/auth/login', json ({ username: 'not-a-user', password: '' }))
    expect (missingUser.status).toBe (404)

    const formLogin = await request ('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams ({ username: 'not-a-user', password: '' })
    })
    expect (formLogin.status).toBe (404)

    const login = await request ('/auth/login', json ({ username: 'admin', password: '' }))
    expect (login.status).toBe (200)
    const user = await login.json ()
    expect (user).toMatchObject ({
      user_id: 1, username: 'admin', roles: ['admin'], password_empty: true
    })
    expect (user.token).toEqual (expect.any (String))
    adminToken = user.token

    const session = await request ('/auth/session', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (session.status).toBe (200)
    expect (await session.json ()).toMatchObject ({
      id: 1, username: 'admin', roles: ['admin'], password_empty: true
    })

    const logout = await request ('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (logout.status).toBe (205)

    const expiredSession = await request ('/auth/session', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (expiredSession.status).toBe (401)
  })

  test ('requires authentication and enforces administrator-only user details', async () => {
    const unauthenticated = await request ('/api/user', {
      headers: { Accept: 'application/json' }
    })
    expect (unauthenticated.status).toBe (401)
    expect (await unauthenticated.json ()).toEqual ({ error: 'Authentication error' })

    const adminLogin = await request ('/auth/login', json ({ username: 'admin', password: '' }))
    adminToken = (await adminLogin.json ()).token

    const regularLogin = await request ('/auth/login', json ({ username: 'readonly', password: '' }))
    expect (regularLogin.status).toBe (200)
    regularToken = (await regularLogin.json ()).token

    const forbidden = await request ('/api/user/1', {
      headers: { Authorization: `Bearer ${regularToken}`, Accept: 'application/json' }
    })
    expect (forbidden.status).toBe (403)
    expect (await forbidden.json ()).toEqual ({ error: 'No admin credentials' })

    const allowed = await request ('/api/user/1', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (allowed.status).toBe (200)
    expect (await allowed.json ()).toMatchObject ({ id: 1, login: 'admin', password: 0 })

    const nestedFilter = await request ('/api/user?filter%5Blogin%5D%5Beq%5D=admin', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (nestedFilter.status).toBe (200)
    expect (await nestedFilter.json ()).toEqual ([
      expect.objectContaining ({ id: 1, login: 'admin' })
    ])
  })

  test ('returns the established validation and unknown-route errors', async () => {
    const invalid = await request ('/api/user', json ({}, adminToken))
    expect (invalid.status).toBe (400)
    expect (await invalid.json ()).toEqual ({ error: 'Create new user: login name is required' })

    const unknown = await request ('/api/not-a-resource', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (unknown.status).toBe (400)
    expect (await unknown.json ()).toEqual ({ error: 'Unknown command or resource' })

    const invalidId = await request ('/api/user/not-a-number', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invalidId.status).toBe (400)
    expect (await invalidId.json ()).toEqual ({ error: 'Unknown command or resource' })

    const invalidDate = await request ('/api/timeclock/1/not-a-date', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invalidDate.status).toBe (400)
    expect (await invalidDate.json ()).toEqual ({ error: 'Unknown command or resource' })

    const projects = await request ('/api/task/projects', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (projects.status).toBe (200)
    expect (await projects.json ()).toEqual ([])

    const taskCount = await request ('/api/customer/task-count', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (taskCount.status).toBe (200)
  })

  test ('preserves organisation, customer, and invoice CRUD contracts', async () => {
    const organisationResponse = await request ('/api/organisation', json ({
      name: 'Contract Organisation',
      city: 'Contract City'
    }, adminToken))
    expect (organisationResponse.status).toBe (201)
    const organisationId = (await organisationResponse.json ()).id

    const organisation = await request (`/api/organisation/${organisationId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (organisation.status).toBe (200)
    expect (await organisation.json ()).toMatchObject ({
      id: organisationId,
      name: 'Contract Organisation',
      city: 'Contract City'
    })

    const organisationUpdate = await request (`/api/organisation/${organisationId}`, json ({
      name: 'Updated Contract Organisation',
      city: 'Updated Contract City'
    }, adminToken, 'PUT'))
    expect (organisationUpdate.status).toBe (204)

    const customerResponse = await request ('/api/customer', json ({
      name: 'Contract Customer',
      organisation_id: organisationId
    }, adminToken))
    expect (customerResponse.status).toBe (201)
    const customerId = (await customerResponse.json ()).id

    const customerList = await request (`/api/customer?filter%5Bid%5D%5Beq%5D=${customerId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (customerList.status).toBe (200)
    expect (await customerList.json ()).toEqual ([
      expect.objectContaining ({
        id: customerId,
        name: 'Contract Customer',
        organisation_name: 'Updated Contract Organisation'
      })
    ])

    const customerCount = await request (`/api/customer/count?filter%5Bid%5D%5Beq%5D=${customerId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (customerCount.status).toBe (200)
    expect (await customerCount.json ()).toEqual ({ count: 1 })

    const taskCount = await request (`/api/customer/task-count?filter%5Bid%5D%5Beq%5D=${customerId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (taskCount.status).toBe (200)
    expect (await taskCount.json ()).toEqual ([{ id: customerId, task_count: 0 }])

    const invoiceResponse = await request ('/api/invoice', json ({
      invoice_no: 'CONTRACT-001',
      customer_id: customerId,
      status: 'draft',
      date: '2026-10-21',
      due_date: '2026-11-20',
      address: 'Contract Address',
      currency: 'EUR',
      net_total: 12.5,
      grand_total: 12.5
    }, adminToken))
    expect (invoiceResponse.status).toBe (201)
    const invoiceId = (await invoiceResponse.json ()).id

    const invoiceList = await request (`/api/invoice?filter%5Bid%5D%5Beq%5D=${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invoiceList.status).toBe (200)
    expect (await invoiceList.json ()).toEqual ([
      expect.objectContaining ({
        id: invoiceId,
        invoice_no: 'CONTRACT-001',
        customer_name: 'Contract Customer'
      })
    ])

    const invoiceCount = await request (`/api/invoice/count?filter%5Bid%5D%5Beq%5D=${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invoiceCount.status).toBe (200)
    expect (await invoiceCount.json ()).toEqual ({ count: 1 })

    const itemResponse = await request ('/api/invoice-item', json ({
      invoice_id: invoiceId,
      description: 'Contract item',
      quantity: 2,
      unit_price: 6.25
    }, adminToken))
    expect (itemResponse.status).toBe (201)
    const itemId = (await itemResponse.json ()).id

    const invoiceItemList = await request (`/api/invoice-item?filter%5Binvoice_id%5D%5Beq%5D=${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invoiceItemList.status).toBe (200)
    expect (await invoiceItemList.json ()).toEqual ([
      { id: itemId, invoice_id: invoiceId }
    ])

    const invoiceItemRead = await request (`/api/invoice-item/${itemId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invoiceItemRead.status).toBe (200)
    expect (await invoiceItemRead.json ()).toMatchObject ({ id: itemId, description: 'Contract item' })

    const invoiceItemUpdate = await request (`/api/invoice-item/${itemId}`, json ({
      quantity: 3
    }, adminToken, 'PUT'))
    expect (invoiceItemUpdate.status).toBe (204)

    const invoiceItems = await request (`/api/invoice/${invoiceId}/items`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invoiceItems.status).toBe (200)
    expect (await invoiceItems.json ()).toEqual ([
      expect.objectContaining ({ id: itemId, invoice_id: invoiceId, quantity: 3 })
    ])

    const invoiceItemDelete = await request (`/api/invoice-item/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (invoiceItemDelete.status).toBe (204)

    const invoice = await request (`/api/invoice/${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (invoice.status).toBe (200)
    expect (await invoice.json ()).toMatchObject ({
      id: invoiceId,
      invoice_no: 'CONTRACT-001',
      customer_id: customerId
    })

    const invoiceUpdate = await request (`/api/invoice/${invoiceId}`, json ({
      headline: 'Updated contract invoice'
    }, adminToken, 'PUT'))
    expect (invoiceUpdate.status).toBe (204)

    const updatedInvoice = await request (`/api/invoice/${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (updatedInvoice.status).toBe (200)
    expect (await updatedInvoice.json ()).toMatchObject ({ headline: 'Updated contract invoice' })

    const invoiceDelete = await request (`/api/invoice/${invoiceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (invoiceDelete.status).toBe (204)

    const customerDelete = await request (`/api/customer/${customerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (customerDelete.status).toBe (204)

    const organisationDelete = await request (`/api/organisation/${organisationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (organisationDelete.status).toBe (204)
  })

  test ('preserves time-log CRUD and report contracts', async () => {
    const taskResponse = await request ('/api/task', json ({
      name: 'Contract Task',
      user_id: 1
    }, adminToken))
    expect (taskResponse.status).toBe (201)
    const taskId = (await taskResponse.json ()).id

    const taskCount = await request (`/api/task/count?filter%5Bid%5D%5Beq%5D=${taskId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (taskCount.status).toBe (200)
    expect (await taskCount.json ()).toEqual ({ count: 1 })

    const taskUpdate = await request (`/api/task/${taskId}`, json ({
      name: 'Updated Contract Task'
    }, adminToken, 'PUT'))
    expect (taskUpdate.status).toBe (204)

    const task = await request (`/api/task/${taskId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (task.status).toBe (200)
    expect (await task.json ()).toMatchObject ({ id: taskId, name: 'Updated Contract Task' })

    const timeLogResponse = await request ('/api/timelog', json ({
      task_id: taskId,
      user_id: 1,
      date: '2026-10-21',
      description: 'Contract time log',
      duration: 1.5
    }, adminToken))
    expect (timeLogResponse.status).toBe (201)
    const timeLogId = (await timeLogResponse.json ()).id

    const timeLogList = await request (`/api/timelog?filter%5Bid%5D%5Beq%5D=${timeLogId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (timeLogList.status).toBe (200)
    expect (await timeLogList.json ()).toEqual ([
      expect.objectContaining ({
        id: timeLogId,
        task_id: taskId,
        task_name: 'Updated Contract Task',
        duration: 1.5
      })
    ])

    const timeLogCount = await request (`/api/timelog/count?filter%5Bid%5D%5Beq%5D=${timeLogId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (timeLogCount.status).toBe (200)
    expect (await timeLogCount.json ()).toEqual ({ count: 1 })

    const timeLog = await request (`/api/timelog/${timeLogId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (timeLog.status).toBe (200)
    expect (await timeLog.json ()).toMatchObject ({
      id: timeLogId,
      task_id: taskId,
      duration: 1.5
    })

    const timeLogUpdate = await request (`/api/timelog/${timeLogId}`, json ({
      duration: 2.5
    }, adminToken, 'PUT'))
    expect (timeLogUpdate.status).toBe (204)

    const reportFilter = `filter%5Btask_id%5D%5Beq%5D=${taskId}`
    const report = await request (`/api/timelog/report?${reportFilter}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (report.status).toBe (200)
    expect (await report.json ()).toEqual ([
      expect.objectContaining ({
        id: timeLogId,
        task_id: taskId,
        task_name: 'Updated Contract Task',
        duration: 2.5,
        date: '2026-10-21'
      })
    ])

    const daily = await request (`/api/timelog/daily?${reportFilter}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (daily.status).toBe (200)
    expect (await daily.json ()).toEqual ([{ date: '2026-10-21', duration: 2.5 }])

    const total = await request (`/api/timelog/sum?${reportFilter}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (total.status).toBe (200)
    expect (await total.json ()).toEqual ({ duration: 2.5 })

    const timeLogDelete = await request (`/api/timelog/${timeLogId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (timeLogDelete.status).toBe (204)

    const emptyTotal = await request (`/api/timelog/sum?${reportFilter}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (emptyTotal.status).toBe (200)
    expect (await emptyTotal.json ()).toEqual ({ duration: 0 })

    const taskDelete = await request (`/api/task/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (taskDelete.status).toBe (204)
  })

  test ('preserves person, contact, employee, user, time-clock, and setting contracts', async () => {
    const organisationResponse = await request ('/api/organisation', json ({
      name: 'Related Records Organisation',
      city: 'Related Records City'
    }, adminToken))
    expect (organisationResponse.status).toBe (201)
    const organisationId = (await organisationResponse.json ()).id

    const personResponse = await request ('/api/person', json ({
      first_name: 'Contract',
      last_name: 'Person',
      city: 'Contract City'
    }, adminToken))
    expect (personResponse.status).toBe (201)
    const personId = (await personResponse.json ()).id

    const personUpdate = await request (`/api/person/${personId}`, json ({
      first_name: 'Updated',
      city: 'Updated City'
    }, adminToken, 'PUT'))
    expect (personUpdate.status).toBe (204)

    const person = await request (`/api/person/${personId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (person.status).toBe (200)
    expect (await person.json ()).toMatchObject ({
      id: personId,
      first_name: 'Updated',
      city: 'Updated City'
    })

    const personList = await request (`/api/person?filter%5Bid%5D%5Beq%5D=${personId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (personList.status).toBe (200)
    expect (await personList.json ()).toEqual ([
      expect.objectContaining ({ id: personId, first_name: 'Updated', city: 'Updated City' })
    ])

    const personCount = await request (`/api/person/count?filter%5Bid%5D%5Beq%5D=${personId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (personCount.status).toBe (200)
    expect (await personCount.json ()).toEqual ({ count: 1 })

    const contactResponse = await request ('/api/contact', json ({
      entity_id: personId,
      type: 'email',
      entry: 'contract@example.invalid'
    }, adminToken))
    expect (contactResponse.status).toBe (201)
    const contactId = (await contactResponse.json ()).id

    const contactUpdate = await request (`/api/contact/${contactId}`, json ({
      entry: 'updated@example.invalid'
    }, adminToken, 'PUT'))
    expect (contactUpdate.status).toBe (204)

    const contacts = await request (`/api/person/${personId}/contacts`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (contacts.status).toBe (200)
    expect (await contacts.json ()).toEqual ([
      expect.objectContaining ({ id: contactId, type: 'email', entry: 'updated@example.invalid' })
    ])

    const employeeResponse = await request ('/api/employee', json ({
      organisation_id: organisationId,
      person_id: personId,
      position: 'Consultant'
    }, adminToken))
    expect (employeeResponse.status).toBe (201)
    const employeeId = (await employeeResponse.json ()).id

    const employee = await request (`/api/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (employee.status).toBe (200)
    expect (await employee.json ()).toMatchObject ({
      id: employeeId,
      organisation_id: organisationId,
      person_id: personId,
      position: 'Consultant'
    })

    const personOrganisations = await request (`/api/person/${personId}/organisations`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (personOrganisations.status).toBe (200)
    expect (await personOrganisations.json ()).toEqual ([
      expect.objectContaining ({ organisation_id: organisationId, name: 'Related Records Organisation' })
    ])

    const employeeUpdate = await request (`/api/employee/${employeeId}`, json ({
      position: 'Manager'
    }, adminToken, 'PUT'))
    expect (employeeUpdate.status).toBe (204)

    const updatedEmployee = await request (`/api/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (updatedEmployee.status).toBe (200)
    expect (await updatedEmployee.json ()).toMatchObject ({ position: 'Manager' })

    const userResponse = await request ('/api/user', json ({
      person_id: personId,
      login: 'contract-user',
      roles: 'contacts'
    }, adminToken))
    expect (userResponse.status).toBe (201)
    const userId = (await userResponse.json ()).id

    const userRead = await request (`/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (userRead.status).toBe (200)
    expect (await userRead.json ()).toMatchObject ({
      id: userId,
      login: 'contract-user',
      password: 0
    })

    const userList = await request (`/api/user?filter%5Bid%5D%5Beq%5D=${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (userList.status).toBe (200)
    expect (await userList.json ()).toEqual ([
      expect.objectContaining ({ id: userId, login: 'contract-user', name: 'Updated Person' })
    ])

    const passwordUpdate = await request (`/api/user/${userId}/password`, json ({
      oldPassword: '',
      password: 'contract-password'
    }, adminToken, 'PUT'))
    expect (passwordUpdate.status).toBe (204)

    const passwordLogin = await request ('/auth/login', json ({
      username: 'contract-user',
      password: 'contract-password'
    }))
    expect (passwordLogin.status).toBe (200)
    const passwordLoginUser = await passwordLogin.json ()
    expect (passwordLoginUser.password_empty).toBe (false)

    const passwordReset = await request (`/api/user/${userId}/password`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (passwordReset.status).toBe (204)
    const resetSession = await request ('/auth/session', {
      headers: { Authorization: `Bearer ${passwordLoginUser.token}`, Accept: 'application/json' }
    })
    expect (await resetSession.json ()).toMatchObject ({ password_empty: true })

    const resetPasswordLogin = await request ('/auth/login', json ({
      username: 'contract-user',
      password: ''
    }))
    expect (resetPasswordLogin.status).toBe (200)
    expect ((await resetPasswordLogin.json ()).password_empty).toBe (true)

    const recoveredPassword = await request (`/api/user/${userId}/password`, json ({
      oldPassword: '',
      password: 'recovered-contract-password'
    }, adminToken, 'PUT'))
    expect (recoveredPassword.status).toBe (204)

    const recoveredLogin = await request ('/auth/login', json ({
      username: 'contract-user',
      password: 'recovered-contract-password'
    }))
    expect (recoveredLogin.status).toBe (200)
    expect ((await recoveredLogin.json ()).password_empty).toBe (false)

    const rejectedEmptyPassword = await request ('/auth/login', json ({
      username: 'contract-user',
      password: ''
    }))
    expect (rejectedEmptyPassword.status).toBe (401)

    const userUpdate = await request (`/api/user/${userId}`, json ({
      is_active: 0
    }, adminToken, 'PUT'))
    expect (userUpdate.status).toBe (204)

    const updatedUser = await request (`/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (updatedUser.status).toBe (200)
    expect (await updatedUser.json ()).toMatchObject ({ is_active: 0 })

    const timeClockResponse = await request ('/api/timeclock', json ({
      user_id: 1,
      date: '2026-10-21',
      arrival_time: '09:00',
      departure_time: '17:00',
      work_duration: 8
    }, adminToken))
    expect (timeClockResponse.status).toBe (201)

    const timeClockPath = '/api/timeclock/1/2026-10-21'
    const timeClock = await request (timeClockPath, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (timeClock.status).toBe (200)
    expect (await timeClock.json ()).toMatchObject ({
      user_id: 1,
      date: '2026-10-21',
      work_duration: 8
    })

    const timeClockCount = await request ('/api/timeclock/count?filter%5Buser_id%5D%5Beq%5D=1', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (timeClockCount.status).toBe (200)
    expect (await timeClockCount.json ()).toEqual ({ count: 1 })

    const timeClockUpdate = await request (timeClockPath, json ({
      work_duration: 7.5
    }, adminToken, 'PUT'))
    expect (timeClockUpdate.status).toBe (204)

    const updatedTimeClock = await request (timeClockPath, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (updatedTimeClock.status).toBe (200)
    expect (await updatedTimeClock.json ()).toMatchObject ({ work_duration: 7.5 })

    const settingResponse = await request ('/api/setting', json ({
      key: 'contract.locale',
      value: 'en'
    }, adminToken))
    expect (settingResponse.status).toBe (201)

    const setting = await request ('/api/setting/contract.locale', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (setting.status).toBe (200)
    expect (await setting.json ()).toEqual ({ key: 'contract.locale', value: 'en' })

    const settings = await request ('/api/settings/contract.', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (settings.status).toBe (200)
    expect (await settings.json ()).toEqual ([{ key: 'contract.locale', value: 'en' }])

    const settingUpdate = await request ('/api/setting/contract.locale', json ({
      value: 'de'
    }, adminToken, 'PUT'))
    expect (settingUpdate.status).toBe (204)

    const updatedSetting = await request ('/api/setting/contract.locale', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (updatedSetting.status).toBe (200)
    expect (await updatedSetting.json ()).toEqual ({ key: 'contract.locale', value: 'de' })

    const settingDelete = await request ('/api/setting/contract.locale', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (settingDelete.status).toBe (204)

    const timeClockDelete = await request (timeClockPath, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (timeClockDelete.status).toBe (204)

    const employeeDelete = await request (`/api/employee/${employeeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (employeeDelete.status).toBe (204)

    const contactDelete = await request (`/api/contact/${contactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (contactDelete.status).toBe (204)

    const userDelete = await request (`/api/user/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (userDelete.status).toBe (204)

    const personDelete = await request (`/api/person/${personId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (personDelete.status).toBe (204)

    const organisationDelete = await request (`/api/organisation/${organisationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (organisationDelete.status).toBe (204)
  })

  test ('restricts CORS to configured origins', async () => {
    const allowedOrigin = 'http://127.0.0.1:5403'
    const preflight = await request ('/api/user', {
      method: 'OPTIONS',
      headers: {
        Origin: allowedOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization'
      }
    })
    expect (preflight.status).toBe (204)
    expect (preflight.headers.get ('access-control-allow-origin')).toBe (allowedOrigin)

    const denied = await request ('/health', {
      headers: { Origin: 'https://untrusted.example.invalid' }
    })
    expect (denied.status).toBe (200)
    expect (denied.headers.get ('access-control-allow-origin')).toBeNull ()
  })

  test ('omits credential bodies and redacts sensitive fields from request logs', async () => {
    const loggerSpy = jest.spyOn (apiLogger, 'debug')
    const login = await request ('/auth/login', json ({
      username: 'missing-log-user',
      password: 'login-secret-marker'
    }))
    expect (login.status).toBe (404)

    const invalidUser = await request ('/api/user', json ({
      password: 'body-secret-marker',
      metadata: {
        access_token: 'nested-secret-marker',
        display: 'safe value'
      }
    }, adminToken))
    expect (invalidUser.status).toBe (400)

    const passwordChange = await request ('/api/user/1/password', json ({
      oldPassword: '',
      password: 'route-secret-marker'
    }, adminToken, 'PUT'))
    expect (passwordChange.status).toBe (204)

    const passwordReset = await request ('/api/user/1/password', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect (passwordReset.status).toBe (204)

    const requestLog = (path: string) => loggerSpy.mock.calls.find (call =>
      call.some (value => typeof value === 'string' && value.includes (path))
    )
    const loginLog = requestLog ('POST /auth/login')
    expect (loginLog).toBeDefined ()
    expect (loginLog[0]).not.toHaveProperty ('body')

    const userLog = requestLog ('POST /api/user')
    expect (userLog).toBeDefined ()
    expect (userLog[0]).toMatchObject ({
      body: {
        password: '[REDACTED]',
        metadata: {
          access_token: '[REDACTED]',
          display: 'safe value'
        }
      }
    })

    const passwordLog = requestLog ('PUT /api/user/1/password')
    expect (passwordLog).toBeDefined ()
    expect (passwordLog[0]).not.toHaveProperty ('body')
    expect (JSON.stringify (loggerSpy.mock.calls)).not.toContain ('secret-marker')
    loggerSpy.mockRestore ()
  })
})
