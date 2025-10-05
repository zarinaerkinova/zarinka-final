import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist'
  }
})
