import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // En desarrollo, /api se reenvía al backend: sin problemas de CORS ni URLs fijas en el código.
      proxy: {
        '/api': env.VITE_BACKEND_URL || 'http://localhost:3000',
      },
    },
  }
})
