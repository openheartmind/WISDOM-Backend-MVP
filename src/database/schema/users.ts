import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Postgres schema (for dev and prod)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: text('authId').unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull().default('error'),
  fullName: text('full_name').default(''),
  phone: text('phone').default(''),
  country: text('country').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
