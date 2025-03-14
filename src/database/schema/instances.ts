import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// Postgres schema (for dev and prod)
export const pgInstances = pgTable('instances', {
  id: uuid().primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdBy: text('created_by').references(() => users.authId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const instances = pgInstances;
