import { Module, Global, Logger } from '@nestjs/common';


import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports:[ConfigModule],
  providers: [
    DatabaseService,
    
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
