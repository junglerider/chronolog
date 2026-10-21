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
  let tempDirectory: string

  const request = (url: string, init: RequestInit = {}) => fetch (`${baseUrl}${url}`, init)
  const json = (body: object, token?: string): RequestInit => ({
    method: 'POST',
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
    const module = require ('../src/App')
    app = module.default
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

    const login = await request ('/auth/login', json ({ username: 'admin', password: '' }))
    expect (login.status).toBe (200)
    const user = await login.json ()
    expect (user).toMatchObject ({ user_id: 1, username: 'admin', roles: ['admin'] })
    expect (user.token).toEqual (expect.any (String))
    adminToken = user.token

    const session = await request ('/auth/session', {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' }
    })
    expect (session.status).toBe (200)
    expect (await session.json ()).toMatchObject ({ id: 1, username: 'admin', roles: ['admin'] })

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
  })
})
