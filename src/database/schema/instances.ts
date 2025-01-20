import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const pgInstances = pgTable('instances', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const instances = pgInstances;
