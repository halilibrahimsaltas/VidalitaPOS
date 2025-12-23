import { execSync } from 'child_process';
import { prisma } from '../src/config/database.js';

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

async function waitForDatabase() {
  console.log('⏳ Waiting for database to be ready...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Try to connect to database using Prisma
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      await prisma.$disconnect();
      return true;
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${MAX_RETRIES}: Database not ready yet...`);
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  console.error('❌ Database connection failed after all retries');
  return false;
}

async function runMigration() {
  console.log('🔄 Running database migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function startServer() {
  console.log('🚀 Starting server...');
  // Import and start the server
  const { default: app } = await import('../src/app.js');
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

async function main() {
  try {
    // Wait for database to be ready
    const dbReady = await waitForDatabase();
    if (!dbReady) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Run migrations
    const migrationSuccess = await runMigration();
    if (!migrationSuccess) {
      console.error('❌ Migration failed, but continuing...');
      // Continue anyway - maybe migrations are already applied
    }
    
    // Start server
    await startServer();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

