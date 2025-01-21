import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/test/index.ts',
  out: './drizzle-test',
  dialect: 'postgresql',
  driver: 'pglite',
  dbCredentials: {
    url: './drizzle-test/database',
  }
} satisfies Config;
