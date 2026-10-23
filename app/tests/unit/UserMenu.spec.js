import { beforeEach, vi } from 'vitest'
import UserMenu from '../../src/components/UserMenu.vue'
import { loadThemePreference } from '../../src/services/theme'

vi.mock('../../src/services/api', () => ({
  default: {
    user: {}
  }
}))

describe('UserMenu theme toggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it.each([
    ['light', 'dark'],
    ['dark', 'light']
  ])('toggles %s mode to %s and persists the choice', (currentTheme, nextTheme) => {
    const theme = { global: { name: { value: currentTheme } } }
    const context = {
      theme,
      get isDarkMode() {
        return UserMenu.computed.isDarkMode.call({ theme })
      }
    }

    UserMenu.methods.toggleTheme.call(context)

    expect(theme.global.name.value).toBe(nextTheme)
    expect(loadThemePreference()).toBe(nextTheme)
  })
})
