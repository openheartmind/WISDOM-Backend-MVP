import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const users = pgTable('users', {
  authId: text('authId').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  username: text('username').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
