import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // ✅ this must be '/' for custom domain
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.zarinka.uz', // or your Render backend URL
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api.zarinka.uz',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})