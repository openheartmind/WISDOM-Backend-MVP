import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';
import * as testSchema from './schema/test'

export type Database = 
  | NodePgDatabase<typeof schema>
  | PgliteDatabase<typeof testSchema>;
