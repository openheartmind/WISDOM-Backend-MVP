import { Module, Global, Logger } from '@nestjs/common';
import * as schema from '../src/database/schema';
// import { PGlite } from '@electric-sql/pglite';
// import { drizzle } from 'drizzle-orm/pglite';
import { ConfigService } from '@nestjs/config';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: async (configService: ConfigService) => {
        // const db = drizzle(new PGlite(), { schema });
        // // Run migrations here if needed
        // // await migrate(db, { migrationsFolder: './drizzle' });
        
        // return db;
      
        // const databaseURL = configService.get('DATABASE_URL');
        const pool = new Pool({
          connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
          ssl: false,
        });
        const client = await pool.connect();
        const result = await client.query('SELECT current_database(), current_user, version();');
        
        client.release();
        return drizzlePg(pool, { schema });
      },
    },
  ],
  exports: ['DB'],
})
export class TestDatabaseModule {}