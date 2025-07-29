import { Test, TestingModule } from '@nestjs/testing';
import { InstanceController } from './instance.controller';
import { InstanceService } from './instance.service';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { vi } from 'vitest';

// Mock AuthService
const mockAuthService = {
  inviteUser: vi.fn().mockResolvedValue(undefined),
};

describe('InstanceController', () => {
  let controller: InstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [InstanceController],
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

    controller = module.get<InstanceController>(InstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
