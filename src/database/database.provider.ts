import { Provider } from "@nestjs/common";
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import {  } from 'drizzle-orm';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';

import * as schema from './schema';
import * as testSchema from './schema/test'
import { Database } from './database.types';
import { ConfigService } from "@nestjs/config";
import { authUsers } from "drizzle-orm/supabase";
import { EnvironmentVariables } from "src/config/app-config";

export const databaseProvider = {

  provide: 'DB',
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<EnvironmentVariables>,
  ): Promise<Database> => {
    const env = configService.getOrThrow("NODE_ENV");

    if (env === 'test') {
      const pgliteDB = new PGlite();

      return drizzlePglite(pgliteDB, { schema: testSchema });
    } else {
      const pool = new Pool({
        connectionString: configService.getOrThrow("DATABASE_URL"),
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
