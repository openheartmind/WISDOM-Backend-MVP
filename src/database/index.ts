import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const env = process.env.NODE_ENV;
        const logger = new Logger('DatabaseModule');
        let databaseURL: string;
        logger.log('Using Postgres database');
        if(env === 'test'){
          // Supabase connection for both production and development
          databaseURL = configService.get('TEST_DATABASE_URL');
        } else {
          databaseURL = configService.get('DATABASE_URL');
        }
        // Supabase connection for both production and development
        const pool = new Pool({
          connectionString: databaseURL,
          ssl: env === 'production' ? { rejectUnauthorized: false } : false,
        });

        try {
          const client = await pool.connect();
          if (env === 'development') {
            const result = await client.query('SELECT current_database(), current_user, version();');
            logger.log('Connected to database:', {
              database: result.rows[0].current_database,
              user: result.rows[0].current_user,
              version: result.rows[0].version
            });
          }
          client.release();
          return drizzlePg(pool, { schema });
        } catch (error) {
          // logger.error('Database connection error:', error);
          throw error;
        }
      },
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}