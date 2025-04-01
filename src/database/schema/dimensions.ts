import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const pgDimensions = pgTable('dimensions', {
  id: uuid().primaryKey().defaultRandom(),
  title: text('title').notNull(),
  question: text('question').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const dimensions = pgDimensions;
