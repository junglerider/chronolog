import { vi } from 'vitest'
import App from '../../src/App.vue'
import router from '../../src/router'
import api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  default: {
    user: { roles: [] },
    reloadSession: vi.fn()
  }
}))

describe('App', () => {
  it('restores the session when opened directly on a report page', async () => {
    const sessionUser = { id: 1, roles: ['invoicing'] }
    api.user = { roles: [] }
    api.reloadSession.mockImplementation(async () => {
      api.user = sessionUser
    })
    const context = { user: api.user }

    await App.mounted.call(context)

    expect(api.reloadSession).toHaveBeenCalledOnce()
    expect(context.user).toBe(sessionUser)
  })

  it('redirects an invoice report URL without an invoice id to the invoice list', () => {
    const route = router.resolve('/reports/invoice/')

    expect(route.matched.at(-1).redirect).toBe('/invoices')
  })

  it('matches invoice report URLs that include an invoice id', () => {
    const route = router.resolve('/reports/invoice/42')

    expect(route.matched.at(-1).components.default).toBeDefined()
  })
})
