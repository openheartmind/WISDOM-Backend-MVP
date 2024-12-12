import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRoleSupabaseService } from './service-role-supabase.service';

describe('ServiceRoleSupabaseService', () => {
  let service: ServiceRoleSupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ServiceRoleSupabaseService],
    }).compile();

    service = module.get<ServiceRoleSupabaseService>(
      ServiceRoleSupabaseService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
