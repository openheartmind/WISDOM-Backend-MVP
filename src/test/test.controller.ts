import { Controller, Get, Inject, Logger } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { pgUsers } from '../database/schema';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>
  ) {
    this.logger.log('DB instance details:', {
      isDefined: !!this.db,
      hasQuery: !!this.db?.query,
      methods: Object.keys(this.db || {})
    });
  }

  @Get('/db-test')
  @ApiOperation({ summary: 'Test Database Connection' })
  @ApiResponse({ status: 200, description: 'Database connection successful' })
  @ApiResponse({ status: 500, description: 'Database connection error' })
  async testDb() {
    try {
      // First test a raw SQL query
      const rawResult = await this.db.execute(sql`SELECT 1 as test`);
      this.logger.log('Raw query result:', rawResult);

      // Insert a test user
      const insertedUser = await this.db.insert(pgUsers).values({
        email: 'test@example.com'
      }).returning();
      this.logger.log('Inserted user:', insertedUser);
      
      // Then try the pgUsers query
      const result = await this.db.query.pgUsers.findFirst();
      this.logger.log('pgUsers query result:', result);
      return { message: 'Database connection successful', data: result };
    } catch (error) {
      this.logger.error('Database error:', {
        error: error.message,
        dbDefined: !!this.db,
        queryDefined: !!this.db?.query,
        stack: error.stack
      });
      throw error;
    }
  }
}