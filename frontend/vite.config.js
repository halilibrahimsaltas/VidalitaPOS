import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Electron için optimize edilmiş config
// Not: Bu proje sadece Electron için kullanılıyor, web deployment yok
export default defineConfig({
  base: './', // Electron için her zaman relative path (file:// protokolü için gerekli)
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Electron için asset path'lerini düzelt
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy uploads to backend
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Make uploads folder accessible as static files
  publicDir: 'public',
})

