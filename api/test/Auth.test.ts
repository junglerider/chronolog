import { Auth } from '../src/Auth'
import { MockDatabase } from './MockDatabase'
import { createMockLogger } from './MockLogger'
import { UserSession } from '../src/UserSession'

const makeRequest = (overrides: any = {}) => ({
  headers: {},
  body: {},
  params: { id: '1' },
  ...overrides
})

const makeResponse = () => ({
  status: jest.fn ().mockReturnThis (),
  json: jest.fn ().mockReturnThis ()
})

describe ('Auth', () => {
  let auth: Auth
  let db: MockDatabase
  let logger

  beforeEach (() => {
    db = new MockDatabase ({
      error: new Error ('database failure'),
      callSucceeds: true,
      runResult: { lastID: 1, changes: 1 },
      getResult: null,
      allResult: []
    })
    logger = createMockLogger ()
    auth = new Auth ({ session_timeout: 3600000 }, db, logger)
  })

  afterEach (() => {
    auth.close ()
    jest.restoreAllMocks ()
  })

  test ('hashes passwords with a random salt and validates credentials during login', async () => {
    const storedPassword = await auth.hash ('secret')
    const user = {
      id: 3, login: 'alice', name: 'Alice Example', password: storedPassword,
      roles: 'reporting,contacts', visits: 2, last_visit: null
    }
    const rejectedResponse = makeResponse ()
    const rejectedNext = jest.fn ()
    db.get.mockResolvedValueOnce (user)
    await auth.login (makeRequest ({ body: { username: 'alice', password: 'wrong' } }), rejectedResponse as any, rejectedNext)
    expect (rejectedResponse.status).toHaveBeenCalledWith (401)
    expect (rejectedNext).toHaveBeenCalledWith ()

    const acceptedResponse = makeResponse ()
    db.get.mockResolvedValueOnce (user)
    await auth.login (makeRequest ({ body: { username: 'alice', password: 'secret' } }), acceptedResponse as any, jest.fn ())
    const result = acceptedResponse.json.mock.calls[0][0]
    expect (acceptedResponse.status).toHaveBeenCalledWith (200)
    expect (result).toMatchObject ({
      user_id: 3, username: 'alice', name: 'Alice Example', roles: ['reporting', 'contacts']
    })
    expect (result.token).toEqual (expect.any (String))
    expect (db.run).toHaveBeenCalledWith (
      'UPDATE user SET visits = ?, last_visit = ? WHERE id = ?',
      [3, expect.any (String), 3]
    )

    const missingResponse = makeResponse ()
    db.get.mockResolvedValueOnce (null)
    await auth.login (makeRequest ({ body: { username: 'missing' } }), missingResponse as any, jest.fn ())
    expect (missingResponse.status).toHaveBeenCalledWith (404)
  })

  test ('reports database errors from login through next', async () => {
    const next = jest.fn ()
    const error = new Error ('database unavailable')
    db.get.mockRejectedValueOnce (error)

    await auth.login (makeRequest (), makeResponse () as any, next)

    expect (next).toHaveBeenCalledWith (error)
  })

  test ('authenticates, retrieves, recycles, and removes bearer sessions', async () => {
    db.get.mockResolvedValueOnce ({
      id: 5, login: 'bob', name: 'Bob Example', password: null, roles: null, visits: -1
    })
    const loginResponse = makeResponse ()
    await auth.login (makeRequest ({ body: { username: 'bob' } }), loginResponse as any, jest.fn ())
    const token = loginResponse.json.mock.calls[0][0].token
    const request = makeRequest ({ headers: { authorization: `Bearer ${token}` } })

    expect (auth.authenticate (request as any)).toBe (true)
    expect (request.session).toBeInstanceOf (UserSession)
    expect (auth.authenticate (makeRequest () as any)).toBe (false)

    const sessionResponse = makeResponse ()
    await auth.session (request as any, sessionResponse as any, jest.fn ())
    expect (sessionResponse.status).toHaveBeenCalledWith (200)
    expect (sessionResponse.json.mock.calls[0][0]).toMatchObject ({ id: 5, username: 'bob', roles: [] })

    const missingSession = makeResponse ()
    await auth.session (makeRequest () as any, missingSession as any, jest.fn ())
    expect (missingSession.status).toHaveBeenCalledWith (401)

    const recycled = makeResponse ()
    db.get.mockResolvedValueOnce ({
      id: 5, login: 'bob', name: 'Bob Example', password: null, roles: null, visits: 0
    })
    await auth.login (makeRequest ({
      headers: { authorization: `Bearer ${token}` }, body: { username: 'bob' }
    }), recycled as any, jest.fn ())
    expect (recycled.json.mock.calls[0][0].token).toBe (token)

    const missingLogout = makeResponse ()
    await auth.logout (makeRequest () as any, missingLogout as any, jest.fn ())
    expect (missingLogout.status).toHaveBeenCalledWith (400)

    const logout = makeResponse ()
    await auth.logout (request as any, logout as any, jest.fn ())
    expect (logout.status).toHaveBeenCalledWith (205)
    expect (auth.authenticate (request as any)).toBe (false)
  })

  test ('changes passwords only with the correct old password and resets only as admin', async () => {
    const oldPassword = await auth.hash ('old secret')
    const user = {
      id: 1, login: 'admin', name: 'Admin', password: oldPassword, roles: 'admin', visits: 0
    }
    db.get.mockResolvedValueOnce (user)
    const loginResponse = makeResponse ()
    await auth.login (makeRequest ({ body: { username: 'admin', password: 'old secret' } }), loginResponse as any, jest.fn ())
    const token = loginResponse.json.mock.calls[0][0].token

    const request = makeRequest ({
      headers: { authorization: `Bearer ${token}` },
      body: { oldPassword: 'wrong', password: 'new secret' },
      session: new UserSession ({ time: Date.now (), id: 1, username: 'admin', name: 'Admin', roles: ['admin'] })
    })
    db.get.mockResolvedValueOnce ({ password: oldPassword })
    const wrongPassword = makeResponse ()
    const wrongNext = jest.fn ()
    await auth.updatePassword (request as any, wrongPassword as any, wrongNext)
    expect (wrongNext).toHaveBeenCalledWith (expect.objectContaining ({
      message: '400:Old password of user 1 does not match'
    }))

    db.get.mockResolvedValueOnce ({ password: oldPassword })
    const updatedPassword = makeResponse ()
    await auth.updatePassword ({
      ...request,
      body: { oldPassword: 'old secret', password: 'new secret' }
    } as any, updatedPassword as any, jest.fn ())
    expect (updatedPassword.status).toHaveBeenCalledWith (204)

    const forbiddenUpdate = makeResponse ()
    const forbiddenNext = jest.fn ()
    await auth.updatePassword (makeRequest ({
      body: { oldPassword: 'old secret', password: 'new secret' },
      session: new UserSession ({ time: 1, id: 2, username: 'other', name: 'Other', roles: [] })
    }) as any, forbiddenUpdate as any, forbiddenNext)
    expect (forbiddenNext).toHaveBeenCalledWith (expect.objectContaining ({ message: '403:User 1 cannot change password of another user' }))

    const reset = makeResponse ()
    await auth.resetPassword (makeRequest ({
      session: new UserSession ({ time: 1, id: 1, username: 'admin', name: 'Admin', roles: ['admin'] })
    }) as any, reset as any, jest.fn ())
    expect (reset.status).toHaveBeenCalledWith (204)
    expect (db.run).toHaveBeenLastCalledWith ('UPDATE user SET password = NULL WHERE id = ?', ['1'])

    const deniedReset = makeResponse ()
    const deniedNext = jest.fn ()
    await auth.resetPassword (makeRequest ({
      session: new UserSession ({ time: 1, id: 2, username: 'other', name: 'Other', roles: [] })
    }) as any, deniedReset as any, deniedNext)
    expect (deniedNext).toHaveBeenCalledWith (expect.objectContaining ({ message: '403:User 1 cannot reset password of another user' }))

    db.behaviour.runResult = { lastID: 0, changes: 0 }
    const failedReset = makeResponse ()
    await auth.resetPassword (makeRequest ({
      session: new UserSession ({ time: 1, id: 1, username: 'admin', name: 'Admin', roles: ['admin'] })
    }) as any, failedReset as any, jest.fn ())
    expect (failedReset.status).toHaveBeenCalledWith (500)
  })

  test ('removes sessions when the configured timeout expires', async () => {
    auth.close ()
    let timeoutHandler: Function
    jest.spyOn (global, 'setInterval').mockImplementation (((handler: Function) => {
      timeoutHandler = handler
      return 1 as any
    }) as any)
    jest.spyOn (global, 'clearInterval').mockImplementation (() => undefined)
    const currentTime = jest.spyOn (Date, 'now').mockReturnValue (1000)
    auth = new Auth ({ session_timeout: 100 }, db, logger)
    db.get.mockResolvedValueOnce ({
      id: 1, login: 'timed', name: 'Timed User', password: null, roles: '', visits: 0
    })
    const loginResponse = makeResponse ()
    await auth.login (makeRequest ({ body: { username: 'timed' } }), loginResponse as any, jest.fn ())
    const token = loginResponse.json.mock.calls[0][0].token

    currentTime.mockReturnValue (1200)
    timeoutHandler ()
    const response = makeResponse ()
    await auth.session (makeRequest ({ headers: { authorization: `Bearer ${token}` } }) as any, response as any, jest.fn ())
    expect (response.status).toHaveBeenCalledWith (401)
  })
})
