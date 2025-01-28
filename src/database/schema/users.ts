import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
