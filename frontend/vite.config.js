import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { statSync, createReadStream } from 'fs'

// Simple mime type detection
const getMimeType = (filePath) => {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to serve uploads folder as static files
    {
      name: 'serve-uploads',
      configureServer(server) {
        server.middlewares.use('/uploads', (req, res, next) => {
          const urlPath = req.url.replace(/^\/uploads/, '').replace(/^\//, '')
          const filePath = resolve(__dirname, 'uploads', urlPath)
          
          try {
            const stats = statSync(filePath)
            if (stats.isFile()) {
              const mimeType = getMimeType(filePath)
              res.setHeader('Content-Type', mimeType)
              res.setHeader('Content-Length', stats.size)
              createReadStream(filePath).pipe(res)
              return
            }
          } catch (error) {
            // File doesn't exist, return 404
            res.statusCode = 404
            res.end('File not found')
            return
          }
          next()
        })
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    // Allow serving files from uploads directory
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
  // Make uploads folder accessible as static files
  publicDir: 'public',
})

