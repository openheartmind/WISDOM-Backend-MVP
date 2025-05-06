import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { instances } from './instances';

// Postgres schema (for dev and prod)
export const pgMemberships = pgTable('memberships', {
  id: uuid().primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.authId),
  instanceId: uuid('instance_id').references(() => instances.id),
  role: text('role'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const memberships = pgMemberships;
