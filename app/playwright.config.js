const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.js',
  outputDir: './node_modules/.cache/playwright/test-results',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5403',
    browserName: 'chromium',
    channel: 'chromium'
  },
  webServer: {
    command: 'npm run serve -- --host 127.0.0.1 --port 5403',
    url: 'http://127.0.0.1:5403/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
