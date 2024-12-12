import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import appConfig, { validate } from './config/app-config';

@Module({
  imports: [
    // GLOBAL MODULES
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      load: [appConfig],
    }),

    // Route Modules

    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
