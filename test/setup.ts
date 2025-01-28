import { execSync } from 'child_process';
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // Run migrations before all tests
  console.log('Running Drizzle migrations...');
  try {
    execSync('npm run db:migrate:test', { stdio: 'inherit' });
    console.log('Drizzle migrations completed successfully');
  } catch (error) {
    console.error('Error running Drizzle migrations:', error);
    throw error;
  }
});


