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
        
        logger.log('Using Postgres database');
        
        // Create connection pool with individual parameters
        const pool = new Pool({
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          database: configService.get('DB_NAME'),
          user: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
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
          logger.error('Database connection error:', error);
          throw error;
        }
      },
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}