import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [DatabaseModule, SupabaseModule, MailerModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
