import { Test, TestingModule } from '@nestjs/testing';
import { InstanceService } from './instance.service';
import { describe, beforeEach, it } from 'vitest';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DatabaseModule } from 'src/database/database.module';

describe('InstanceService', () => {
  let service: InstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [InstanceService, NodePgDatabase],
    }).compile();

    service = module.get<InstanceService>(InstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
