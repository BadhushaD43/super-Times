import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react')) {
            return 'reactvendor'
          }

          if (id.includes('chart.js')) {
            return 'chartvendor'
          }

          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})