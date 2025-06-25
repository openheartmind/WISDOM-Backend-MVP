import { Test, TestingModule } from '@nestjs/testing';
import { InstanceService } from './instance.service';
import { describe, beforeEach, it } from 'vitest';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { vi } from 'vitest';

// Mock AuthService
const mockAuthService = {
  inviteUser: vi.fn().mockResolvedValue(undefined),
};

describe('InstanceService', () => {
  let service: InstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        InstanceService, 
        DatabaseService, 
        ConfigService,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<InstanceService>(InstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
