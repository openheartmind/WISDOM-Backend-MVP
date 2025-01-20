import { Test, TestingModule } from '@nestjs/testing';
import { InstanceService } from './instance.service';
import { describe, beforeEach, it } from 'vitest';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

describe('InstanceService', () => {
  let service: InstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstanceService, NodePgDatabase],
    }).compile();

    service = module.get<InstanceService>(InstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
