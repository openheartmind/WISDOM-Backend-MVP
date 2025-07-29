import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { pairings } from './pairings';
import { contributions } from './contributions';
import { users } from './users';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  pairingId: uuid('pairing_id').references(() => pairings.id),
  winningContributionId: uuid('winning_contribution_id').references(
    () => contributions.id,
  ),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
