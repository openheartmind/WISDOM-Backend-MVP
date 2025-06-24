import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { seedData } from './seed';
import * as schema from '../schema';
import { dimensions } from '../schema/dimensions';

import dotenv from 'dotenv';
dotenv.config();

async function runSeed() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Starting database seeding...');
    
    //Remove all existing dimensions
    await db.delete(dimensions);
    
    // Seed dimensions using direct insert
    console.log('📊 Seeding dimensions...');
    const result = await db.insert(dimensions).values(seedData.dimensions).returning();
    
    console.log(`✅ Successfully inserted ${result.length} dimensions:`);
    result.forEach((dimension, index) => {
      console.log(`   ${index + 1}. ${dimension.title}`);
    });
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('🎉 Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script failed:', error);
      process.exit(1);
    });
}

export { runSeed }; 