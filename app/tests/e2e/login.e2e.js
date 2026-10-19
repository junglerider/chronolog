const { test, expect } = require('@playwright/test')

test('login screen renders and validates a missing username', async ({ page }) => {
  await page.goto('/login')

  await expect(page.locator('.login-title')).toHaveText('chronolog')
  await expect(page.getByLabel('User name')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Required', { exact: true })).toBeVisible()
})
