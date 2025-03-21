import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { instances } from './instances';
import { roles } from './roles';

// Postgres schema (for dev and prod)
export const pgMemberships = pgTable('instances', {
  id: uuid().primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.authId),
  instanceId: text('instance_id').references(() => instances.id),
  roleId: text('role_id').references(() => roles.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export the appropriate schema based on environment
export const memberships = pgMemberships;
