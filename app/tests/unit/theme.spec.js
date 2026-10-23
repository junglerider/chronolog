import { beforeEach } from 'vitest'
import { loadThemePreference, saveThemePreference } from '../../src/services/theme'

describe('theme preference', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to light mode', () => {
    expect(loadThemePreference()).toBe('light')
  })

  it('restores dark mode from browser storage', () => {
    window.localStorage.setItem('chronolog-theme', 'dark')

    expect(loadThemePreference()).toBe('dark')
  })

  it('stores the selected theme', () => {
    saveThemePreference('dark')

    expect(window.localStorage.getItem('chronolog-theme')).toBe('dark')
  })
})
