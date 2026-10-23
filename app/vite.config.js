import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
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
    globals: true,
    server: { deps: { inline: ['vuetify'] } }
  }
})
