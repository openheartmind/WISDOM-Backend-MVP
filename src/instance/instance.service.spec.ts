import { Test, TestingModule } from '@nestjs/testing';
import { InstanceService } from './instance.service';
import { describe, beforeEach, it } from 'vitest';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

describe('InstanceService', () => {
  let service: InstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, AuthModule],
      providers: [InstanceService, DatabaseService, ConfigService],
    }).compile();

    service = module.get<InstanceService>(InstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
