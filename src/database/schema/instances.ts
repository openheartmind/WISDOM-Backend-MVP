import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// Postgres schema (for dev and prod)
export const pgInstances = pgTable('instances', {
  id: uuid().primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  //TODO: Add status enum,ideally enum(prereview, in_review, completed)
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const instances = pgInstances;
