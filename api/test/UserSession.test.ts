import { UserSession } from '../src/UserSession'

describe ('UserSession permissions', () => {
  const session = (roles: string[], id = 7) =>
    new UserSession ({ time: 1, id, username: 'test', name: 'Test User', roles, password_empty: false })

  test ('grants each role and administrator inheritance only where configured', () => {
    const admin = session (['admin'])
    expect (admin.hasAdmin ()).toBe (true)
    expect (admin.hasInvoicing ()).toBe (true)
    expect (admin.hasReporting ()).toBe (true)
    expect (admin.hasContacts ()).toBe (true)

    expect (session (['invoicing']).hasInvoicing ()).toBe (true)
    expect (session (['reporting']).hasReporting ()).toBe (true)
    expect (session (['contacts']).hasContacts ()).toBe (true)
    expect (session ([]).hasAdmin ()).toBe (false)
    expect (session ([]).hasInvoicing ()).toBe (false)
    expect (session ([]).hasReporting ()).toBe (false)
    expect (session ([]).hasContacts ()).toBe (false)
    expect (session ([], 7).hasUserId (7)).toBe (true)
    expect (session ([], 7).hasUserId (8)).toBe (false)
  })
})
