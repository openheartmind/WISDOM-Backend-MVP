import { Controller, Get, Inject, Logger } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema/test';
import { pgUsers } from '../database/schema/test';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import { desc } from 'drizzle-orm';

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>
  ) {
    this.logger.log('TestController initialized with DB injection');
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

      // Generate a unique test email using timestamp
      const timestamp = new Date().getTime();
      const testEmail = `test_${timestamp}@example.com`;

      // Insert a test user
      const insertedUser = await this.db.insert(pgUsers).values({
        email: testEmail
      }).returning();
      this.logger.log('Inserted user:', insertedUser);

      // Get the latest user instead of just the first one
      const result = await this.db.query.pgUsers.findFirst({
        orderBy: (users, { desc }) => [desc(users.createdAt)]
      });
      this.logger.log('Latest user query result:', result);
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
