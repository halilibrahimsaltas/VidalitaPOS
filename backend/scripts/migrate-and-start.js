import { execSync } from 'child_process';
import { prisma } from '../src/config/database.js';

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

async function waitForDatabase() {
  console.log('⏳ Waiting for database to be ready...');
  console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Try to connect to database using Prisma (singleton pattern - connection is reused)
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      
      // Test query to verify connection works
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database query test successful!');
      
      // Don't disconnect - singleton pattern keeps connection alive for reuse
      // Connection will be reused by the server when it starts
      return true;
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${MAX_RETRIES}: Database not ready yet...`);
      console.log(`   Error: ${error.message}`);
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
  console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  
  try {
    // Run migration with explicit error handling
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ Migrations completed successfully!');
    
    // Verify migration by checking if tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;
      console.log(`✅ Database verification: Found ${tables.length} tables`);
      if (tables.length > 0) {
        console.log(`   Tables: ${tables.map(t => t.table_name).join(', ')}`);
      }
    } catch (verifyError) {
      console.warn('⚠️ Could not verify tables, but migration completed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   This might be normal if migrations are already applied.');
    console.error('   Continuing anyway...');
    return false; // Don't exit - maybe migrations are already applied
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
    console.log('🔍 Step 1: Checking database connection...');
    const dbReady = await waitForDatabase();
    
    if (!dbReady) {
      console.error('❌ Database connection failed after all retries');
      console.error('⚠️  Attempting to run migrations anyway (database might be ready but connection test failed)...');
      // Don't exit - try migration anyway, maybe connection test was too strict
    } else {
      console.log('✅ Database connection verified!');
    }
    
    // Run migrations (critical - must succeed or retry)
    console.log('🔍 Step 2: Running database migrations...');
    let migrationSuccess = await runMigration();
    
    // If migration failed, retry once after a short delay
    if (!migrationSuccess) {
      console.log('🔄 Migration failed, retrying once after 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      migrationSuccess = await runMigration();
    }
    
    if (!migrationSuccess) {
      console.error('❌ Migration failed after retry');
      console.error('⚠️  Starting server anyway - tables might already exist');
      // Continue anyway - maybe tables already exist or migration will be manual
    } else {
      console.log('✅ Migrations completed successfully!');
      
      // Try to seed database (optional - won't fail if already seeded)
      console.log('🔍 Step 3: Seeding database (optional)...');
      try {
        execSync('npm run seed', { 
          stdio: 'inherit',
          env: { ...process.env }
        });
        console.log('✅ Database seeded successfully!');
      } catch (seedError) {
        console.warn('⚠️  Seed failed (this is OK if database is already seeded):', seedError.message);
        console.warn('   Continuing anyway...');
      }
    }
    
    // Start server
    console.log('🔍 Step 4: Starting server...');
    await startServer();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();

