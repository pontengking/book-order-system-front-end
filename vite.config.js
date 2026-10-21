import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'
import { Buffer } from 'node:buffer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/api': {
      target: env.API_TARGET || 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.API_USERNAME || 'book'}:${env.API_PASSWORD || 'book'}`).toString('base64')}`,
      },
    },
  }
  return { plugins: [react()], server: { proxy }, preview: { proxy } }
})
