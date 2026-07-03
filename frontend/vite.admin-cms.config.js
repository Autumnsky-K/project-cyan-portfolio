import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: resolve(__dirname, '../backend/src/main/resources/static/admin/cms-puck'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/admin-cms-puck/main.tsx'),
      output: {
        entryFileNames: 'admin-cms-puck.js',
        assetFileNames: 'admin-cms-puck[extname]',
      },
    },
  },
})
