import { execSync } from 'child_process';

const setupTestDatabase = () => {
    try {
        // Create a new branch with no schema
        execSync('supabase branches create test', { stdio: 'inherit' });

        
    
        // Run migrations on the new branch
        execSync('supabase migrate --branch test', { stdio: 'inherit' });
    
        // Seed the database
        execSync('supabase db seed --branch test', { stdio: 'inherit' });
    
      } catch (error) {
        console.error('Failed to set up test database:', error);
        process.exit(1);
      }
};

// Run before all tests
beforeAll(async () => {
  await setupTestDatabase();
});

// Clean up after tests
afterAll(async () => {
  // Switch back to main branch
  execSync('supabase db branches delete test', { stdio: 'inherit' });
});