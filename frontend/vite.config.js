import { defineConfig } from 'vite'

// ✅ This configuration works for both local dev and production (GitHub Pages or custom domain)
export default defineConfig({
  base: './', // Important for GitHub Pages and custom domains (fixes blank page / 404 issues)
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // local backend
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
    outDir: 'dist',
    sourcemap: false, // optional, can set true if you want debugging in production
  },
})
