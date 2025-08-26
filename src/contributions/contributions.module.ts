// src/contributions/contributions.module.ts
import { Module } from '@nestjs/common';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { DatabaseModule } from '../database/database.module';
import { InstanceModule } from 'src/instance/instance.module';

@Module({
  imports: [DatabaseModule, InstanceModule],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
