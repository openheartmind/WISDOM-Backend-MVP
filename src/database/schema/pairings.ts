import { pgTable, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { dimensions } from './dimensions';
import { instances } from './instances';
import { contributions } from './contributions';

export const pairings = pgTable('pairings', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instance_id').references(() => instances.id),
  contribution1Id: uuid('contribution1_id').references(() => contributions.id),
  contribution2Id: uuid('contribution2_id').references(() => contributions.id),
  dimensionId: uuid('dimension_id').references(() => dimensions.id),
  isReviewed: boolean('is_reviewed'),
  isMeta: boolean('is_meta'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
