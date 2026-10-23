import { vi } from 'vitest'
import Invoice from '../../src/reports/Invoice.vue'
import api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  default: {
    user: { roles: [], hasRole: () => false },
    reloadSession: vi.fn(),
    get: vi.fn()
  }
}))

describe('Invoice report', () => {
  it('does not attempt to write an amount before invoice data loads', () => {
    expect(() => Invoice.computed.writtenAmount.call({
      invoice: {},
      $getLanguage: () => 'en'
    })).not.toThrow()
    expect(Invoice.computed.writtenAmount.call({
      invoice: {},
      $getLanguage: () => 'en'
    })).toBe('')
  })

  it('loads the current session before checking invoice access', async () => {
    const sessionUser = {
      id: 1,
      roles: ['invoicing'],
      hasRole: role => role === 'invoicing'
    }
    api.user = { roles: [], hasRole: () => false }
    api.reloadSession.mockImplementation(async () => {
      api.user = sessionUser
    })
    api.get.mockImplementation(async url => {
      if (url === '/invoice/42') {
        return { data: { currency: 'EUR', grand_total: 0, organisation_id: 1 } }
      }
      if (url === '/invoice/42/items') {
        return { data: [] }
      }
      return { data: [] }
    })
    const context = {
      user: api.user,
      invoice: {},
      items: [],
      formatter: null,
      settings: new Map(),
      $route: { params: { id: '42' } },
      $getLanguage: () => 'en'
    }

    await Invoice.mounted.call(context)

    expect(api.reloadSession).toHaveBeenCalledOnce()
    expect(context.user).toBe(sessionUser)
    expect(api.get).toHaveBeenCalledWith('/invoice/42')
  })
})
