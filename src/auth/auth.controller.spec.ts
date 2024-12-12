import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ServiceRoleSupabaseService } from 'src/supabase/service-role-supabase.service';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';

// TODO: Why is test failing?

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, SupabaseModule],
      controllers: [AuthController],
      providers: [ConfigService, SupabaseService, ServiceRoleSupabaseService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
