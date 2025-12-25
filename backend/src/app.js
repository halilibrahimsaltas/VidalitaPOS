import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
// CORS configuration - allow multiple origins for production and development
// Local development için tüm localhost portlarını kabul et
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  /^http:\/\/localhost:\d+$/, // Tüm localhost portları (Electron için)
  /^http:\/\/127\.0\.0\.1:\d+$/, // 127.0.0.1 portları
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or Electron file:// protocol)
    if (!origin) {
      // Electron file:// protokolü için origin null olur, localhost isteklerini kabul et
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      // Production'da sadece belirli origin'lere izin ver
      return callback(null, true); // Electron için gerekli
    }
    
    // Development modunda tüm localhost portlarını kabul et
    if (process.env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Regex pattern'leri kontrol et
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root path - Welcome message
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'VidalitaPOS API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: 'See API documentation for available endpoints'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

