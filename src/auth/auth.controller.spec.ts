import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it } from 'vitest';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { SupabaseService } from 'src/supabase/supabase.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [AuthController],
      providers: [AuthService, DatabaseService, SupabaseService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
