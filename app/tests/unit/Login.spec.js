import { vi } from 'vitest'
import Login from '../../src/views/Login.vue'
import api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  default: {
    login: vi.fn()
  }
}))

describe('Login', () => {
  it.each([
    [true, '/password'],
    [false, '/']
  ])('redirects after login according to password status', async (passwordEmpty, route) => {
    api.login.mockResolvedValue({ data: { password_empty: passwordEmpty } })
    const push = vi.fn()
    const context = {
      $refs: { form: { validate: vi.fn().mockResolvedValue({ valid: true }) } },
      $router: { push },
      username: 'user',
      password: '',
      authError: false
    }

    await Login.methods.login.call(context)

    expect(push).toHaveBeenCalledWith(route)
  })
})
