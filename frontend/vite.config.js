import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['.onrender.com']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000'
      },
    },
  },
})
