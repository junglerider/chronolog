import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Password from '../../src/views/Password.vue'
import api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  default: {
    user: { id: 1, login: 'user', password_empty: true }
  }
}))

describe('Password page', () => {
  it('shows the unsecured-account warning only while the password is empty', () => {
    const warning = 'This account is not secured. Please add a password.'
    const wrapper = mount(Password, {
      global: {
        mocks: { $i18n: text => text },
        stubs: {
          VContainer: { template: '<div><slot /></div>' },
          VForm: { template: '<form><slot /></form>' },
          VAlert: { template: '<div><slot /></div>' },
          VTextField: true,
          VBtn: true,
          VIcon: true,
          VProgressLinear: true
        }
      }
    })
    expect(wrapper.text()).toContain(warning)
    wrapper.unmount()

    api.user.password_empty = false
    const securedWrapper = mount(Password, {
      global: {
        mocks: { $i18n: text => text },
        stubs: {
          VContainer: { template: '<div><slot /></div>' },
          VForm: { template: '<form><slot /></form>' },
          VAlert: { template: '<div><slot /></div>' },
          VTextField: true,
          VBtn: true,
          VIcon: true,
          VProgressLinear: true
        }
      }
    })
    expect(securedWrapper.text()).not.toContain(warning)
    securedWrapper.unmount()
  })
})
