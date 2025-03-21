import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const pgRoles = pgTable('roles', {
  id: uuid().primaryKey().defaultRandom(),
  title: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const roles = pgRoles;
