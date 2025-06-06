// src/database/schema/contributions.ts
import { pgTable, serial, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { instances } from './instances';

export const contributions = pgTable('contributions', {
  id: uuid().primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  contributorId: text('contributor_id').references(() => users.id),
  instanceId: uuid('instance_id').notNull().references(() => instances.id, { onDelete: 'cascade' }),
});

export const contributionsRelations = relations(contributions, ({ one }) => ({
  instance: one(instances, {
    fields: [contributions.instanceId],
    references: [instances.id],
  }),
  contributor: one(users, {
    fields: [contributions.contributorId],
    references: [users.authId],
  }),
}));

export type Contribution = typeof contributions.$inferSelect;