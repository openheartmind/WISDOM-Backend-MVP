import { Provider, Scope } from "@nestjs/common";
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';

import * as schema from './schema';
import { Database } from './database.types';
import { ConfigService } from "@nestjs/config";

export const databaseProvider = {
    
      provide: 'DB',
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<Database> => {
        const env = configService.getOrThrow("NODE_ENV");

        if (env === 'test') {
          
          const pgliteDB = new PGlite();

          return drizzlePglite(pgliteDB, { schema });
        } else {
         
          const pool = new Pool({
            host: configService.get('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            database: configService.get('DB_NAME'),
            user: configService.get('DB_USER'),
            password: configService.get('DB_PASSWORD'),
            ssl: env === 'production' ? { rejectUnauthorized: false } : false,
          });

          try {
            const client = await pool.connect();

            if (env === 'development') {
              const result = await client.query(
                'SELECT current_database() AS database, current_user AS user, version() AS version;',
              );
             
            }

            client.release();
           
            return drizzlePg(pool, { schema });
          } catch (error) {
            throw error;
          }
        }
      },
    
} as Provider