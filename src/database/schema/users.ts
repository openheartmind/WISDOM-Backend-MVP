import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sqliteTable, text as sqliteText, integer } from 'drizzle-orm/sqlite-core';

// Postgres schema (for dev and prod)
export const pgUsers = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SQLite schema (for testing)
export const sqliteUsers = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: sqliteText('email').notNull().unique(),
  name: sqliteText('name'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Export the appropriate schema based on environment
export const users = process.env.NODE_ENV === 'test' ? sqliteUsers : pgUsers;