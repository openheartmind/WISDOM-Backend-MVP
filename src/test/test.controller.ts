import { Controller, Get, Inject, Logger } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../database/schema';
import { pgUsers, sqliteUsers } from '../database/schema';


@Controller('test')
export class TestController {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>
  ) {}

  @Get('/db-test')
  async testDb() {
    if ('withConnection' in this.db) {
      // PostgreSQL
      const result = await this.db.select().from(pgUsers).limit(1);
      return result;
    }
  }
}