import { defineConfig } from 'vite'

export default defineConfig({
  base: '/admin/ai-behavior-lab-app/',
  build: {
    outDir: '../../backend/src/main/resources/static/admin/ai-behavior-lab-app',
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 8002,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
})
