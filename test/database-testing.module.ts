import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
const betterSqlite3 = require('better-sqlite3'); //Type safety is provided by drizzle-orm/better-sqlite3
import * as schema from '../src/database/schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: async () => {
        const sqlite = new betterSqlite3(':memory:');
        const db = drizzle(sqlite, { schema });
        
        // Run migrations here if needed
        // await migrate(db, { migrationsFolder: './drizzle' });
        
        return db;
      },
    },
  ],
  exports: ['DB'],
})
export class TestDatabaseModule {}