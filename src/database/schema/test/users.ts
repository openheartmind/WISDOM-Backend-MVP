import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Postgres schema (for test)
export const pgUsers = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
