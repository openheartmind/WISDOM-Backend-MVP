import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { validate } from 'class-validator';
import { SupabaseModule } from 'nestjs-supabase-js';
import appConfig,{validate} from './config/app-config';
import { AuthController } from './auth/auth.controller';
import { TestController } from './test/test.controller';
import { DatabaseModule } from './database/index';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      load: [appConfig],
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    DatabaseModule,
  ],
  controllers: [AuthController, TestController],
  providers: [
    {
      provide: 'DB',
      useFactory: () => {
        return new DatabaseModule();
      },
    },
  ],
})
export class AppModule {}

