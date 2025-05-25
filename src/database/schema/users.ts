import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const users = pgTable('users', {
  authId: text('authId').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull().default('error'),
  fullName: text('full_name').default(''),
  phone: text('phone').default(''),
  country: text('country').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
