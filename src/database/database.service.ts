// src/core-modules/drizzle/drizzle.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Database } from './database.types';
import { Provider } from "@nestjs/common";
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import {  } from 'drizzle-orm';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';

import * as schema from './schema';
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/config/app-config";


@Injectable()
export class DatabaseService implements OnModuleInit {
  public db: Database

  constructor(
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    const env = this.configService.getOrThrow("NODE_ENV");
   
    if (env === 'test') {
      const pgliteDB = new PGlite();
  
      this.db = drizzlePglite(pgliteDB, { schema: schema });
    } else {
      const pool = new Pool({
        connectionString: this.configService.getOrThrow("DATABASE_URL"),
      });

      try {
        const client = await pool.connect();

        if (env === 'development') {
          const result = await client.query(
            'SELECT current_database() AS database, current_user AS user, version() AS version;',
          );
          console.log('Database connection info:', result.rows[0]);
        }


        this.db = drizzlePg(pool, { schema });
      } catch (error) {
        console.error('Failed to initialize database connection:', error);
        throw new Error(`Database connection failed: ${error.message}`);
      } 
    }
  }


}