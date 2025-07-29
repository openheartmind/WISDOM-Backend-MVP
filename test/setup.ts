import { execSync } from 'child_process';
import { beforeAll, beforeEach } from 'vitest';
const { PGlite } = require('@electric-sql/pglite') as { PGlite: any };
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

let testDb: typeof PGlite;
let isDbInitialized = false;

beforeAll(async () => {

  if(isDbInitialized) return;
  console.log('Initializing test database...');
  
  try {
    // Create fresh in-memory database for each test run
    testDb = new PGlite('./test_db');
    
    // Run migrations directly instead of via npm script
    const db = drizzle(testDb);
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Test database initialized successfully');
    isDbInitialized = true;
  } catch (error) {
    console.error('Error initializing test database:', error);
    throw error;
  }
});
