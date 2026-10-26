export const themePreferenceKey = 'chronolog-theme'

export function loadThemePreference() {
  return window.localStorage.getItem(themePreferenceKey) === 'dark' ? 'dark' : 'light'
}

export function saveThemePreference(theme) {
  window.localStorage.setItem(themePreferenceKey, theme)
}
