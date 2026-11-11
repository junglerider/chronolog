import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'
import App from '../../src/App.vue'
import InvoiceDetails from '../../src/views/InvoiceDetails.vue'
import router from '../../src/router'
import api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  default: {
    user: { id: 1, roles: ['invoicing'], hasRole: () => true },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    nullIt: object => ({ ...object })
  }
}))

const slot = { template: '<div><slot /></div>' }
const form = { template: '<form><slot /></form>', methods: { validate: async () => ({ valid: true }) } }

describe('Invoice duplication', () => {
  it('navigates to a new form and saves a separate invoice and items', async () => {
    const original = {
      id: 42, invoice_no: 'INV-42', customer_id: 1, status: 'draft',
      date: '2026-01-01', due_date: '2026-02-01', address: 'Address',
      currency: 'EUR', created_at: '2026-01-01', updated_at: '2026-01-02'
    }
    const originalItem = { id: 7, invoice_id: 42, description: 'Work', quantity: 2, unit_price: 50 }
    api.get.mockReset().mockImplementation(async url => {
      if (url === '/invoice/42') return { data: { ...original } }
      if (url === '/invoice/42/items') return { data: [{ ...originalItem }] }
      if (url === '/customer?order=name') return { data: [] }
      throw new Error(`Unexpected request: ${url}`)
    })
    api.post.mockReset().mockImplementation(async url => {
      if (url === '/invoice') return { status: 201, data: { id: 43 } }
      if (url === '/invoice-item') return { status: 201, data: { id: 8 } }
      throw new Error(`Unexpected request: ${url}`)
    })
    api.put.mockReset()
    api.delete.mockReset()

    await router.push('/invoices/42')
    await router.isReady()
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        mocks: { $i18n: text => text, $getLanguage: () => 'en', $i18nDate: date => date },
        stubs: {
          SimpleClock: true, NavLink: true, LanguageMenu: true, UserMenu: true,
          VApp: slot, VMain: slot, VContainer: slot, VRow: slot, VCol: slot,
          VForm: form, VBtn: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          VAppBar: true, VNavigationDrawer: true, VSnackbar: true, VTooltip: true,
          VTextField: true, VTextarea: true, VAutocomplete: true, VSelect: true,
          VCombobox: true, VCheckbox: true, CurrencyInput: true, DateInput: true
        }
      }
    })
    await flushPromises()
    const originalView = wrapper.getComponent(InvoiceDetails)
    expect(originalView.vm.invoice.id).toBe(42)
    const duplicateButton = wrapper.findAll('button').find(button => button.text() === 'Duplicate')
    await duplicateButton.trigger('click')
    await flushPromises()

    const duplicateView = wrapper.getComponent(InvoiceDetails)
    expect(duplicateView.vm).not.toBe(originalView.vm)
    expect(router.currentRoute.value.fullPath).toBe('/invoices/new?duplicate=42')
    expect(duplicateView.vm.invoice).toMatchObject({ id: 'new', invoice_no: 'INV-42' })
    expect(duplicateView.vm.invoice).not.toHaveProperty('created_at')
    expect(duplicateView.vm.invoice).not.toHaveProperty('updated_at')
    expect(duplicateView.vm.items[0]).toMatchObject({ invoice_id: 'new', description: 'Work' })
    expect(duplicateView.vm.items[0].id).toMatch(/^new/)

    duplicateView.vm.invoice.invoice_no = 'INV-43'
    await duplicateView.vm.onSave()
    expect(api.post).toHaveBeenCalledTimes(2)
    expect(api.post.mock.calls[0][0]).toBe('/invoice')
    expect(api.post.mock.calls[0][1]).toMatchObject({ invoice_no: 'INV-43' })
    expect(api.post.mock.calls[0][1]).not.toHaveProperty('id')
    expect(api.post.mock.calls[1][0]).toBe('/invoice-item')
    expect(api.post.mock.calls[1][1]).toMatchObject({ invoice_id: 43, description: 'Work' })
    expect(api.post.mock.calls[1][1]).not.toHaveProperty('id')
    expect(api.put).not.toHaveBeenCalled()
    expect(api.delete).not.toHaveBeenCalled()
    expect(duplicateView.vm.invoice.id).toBe(43)
    expect(duplicateView.vm.items[0].id).toBe(8)
    expect(original.id).toBe(42)
    expect(originalItem.id).toBe(7)

    duplicateView.vm.invoice.address = 'New address'
    await duplicateView.vm.onSave()
    expect(api.put).toHaveBeenCalledWith('/invoice/43', expect.objectContaining({ address: 'New address' }))
    wrapper.unmount()
  })

  it('prevents saving if the duplicate cannot be fully loaded', async () => {
    api.get.mockReset().mockImplementation(async url => {
      if (url === '/invoice/42') return { data: { id: 42 } }
      throw new Error('Load failed')
    })
    api.post.mockReset()
    api.put.mockReset()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const context = {
      $route: { params: { id: 'new' }, query: { duplicate: '42' } },
      showMessage: vi.fn(),
      isReady: false
    }
    await InvoiceDetails.mounted.call(context)
    expect(context.showMessage).toHaveBeenCalledWith('Record could not be loaded.', 'error')
    expect(context.isReady).toBe(false)
    await InvoiceDetails.methods.onSave.call(context)
    expect(api.post).not.toHaveBeenCalled()
    expect(api.put).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
