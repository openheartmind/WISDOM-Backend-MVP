import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const env = process.env.NODE_ENV;

        if (env === 'test') {
          // SQLite for testing
          const sqlite = new Database(':memory:');
          return drizzleSqlite(sqlite, { schema });
        } 
        
        if (env === 'production') {
          // Supabase connection
          const pool = new Pool({
            connectionString: configService.get('DATABASE_URL'),
            ssl: { rejectUnauthorized: false }
          });
          return drizzlePg(pool, { schema });
        }

        // Local Postgres for development
        const pool = new Pool({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          user: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
        });
        return drizzlePg(pool, { schema });
      },
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}