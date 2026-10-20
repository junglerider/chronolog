import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    host: '127.0.0.1',
    port: 5403,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  },
  test: {
    include: ['tests/unit/**/*.spec.js'],
    environment: 'jsdom',
    globals: true
  }
})
