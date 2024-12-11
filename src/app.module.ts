import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { validate } from 'class-validator';
import { SupabaseModule } from 'nestjs-supabase-js';
import appConfig, { validate } from './config/app-config';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      load: [appConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [],
})
export class AppModule {}
