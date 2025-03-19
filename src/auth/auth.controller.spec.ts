import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it } from 'vitest';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from './auth.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { DatabaseService } from 'src/database/database.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { MailerService } from 'src/mailer/mailer.service';
import { MailerModule } from 'src/mailer/mailer.module';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        SupabaseModule,
        MailerModule,
      ],
      controllers: [AuthController],
      providers: [DatabaseService, SupabaseService, AuthService, MailerService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
