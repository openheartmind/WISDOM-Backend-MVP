import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ServiceRoleSupabaseService } from './service-role-supabase.service';

describe('ServiceRoleSupabaseService', () => {
  let service: ServiceRoleSupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [ConfigService, ServiceRoleSupabaseService],
    }).compile();

    service = module.get<ServiceRoleSupabaseService>(
      ServiceRoleSupabaseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
