import { PrismaClient } from '@prisma/client';

// Singleton pattern: Prevent connection flooding in serverless/free-tier environments
// This ensures Prisma Client is reused across all requests instead of creating new instances
// 
// Problem: Without this pattern, each import/request can create a new PrismaClient instance,
// leading to connection flooding (too many connections) on free-tier databases (10-20 limit)
//
// Solution: Cache PrismaClient in global scope so all imports share the same instance
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Cache Prisma Client in global scope to prevent multiple instances
// This works in both development and production:
// - Development: Prevents hot-reload from creating new connections
// - Production: Ensures singleton pattern across all requests (critical for free-tier DBs)
globalForPrisma.prisma = prisma;

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

