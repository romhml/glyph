import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' } // Node >=17

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 3000 },
  plugins: [vue(), crx({ manifest })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
