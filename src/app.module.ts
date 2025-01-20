import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { validate } from 'class-validator';
import appConfig, { validate } from './config/app-config';
import { AuthController } from './auth/auth.controller';
import { DatabaseModule } from './database/database.module';
import { TestController } from './test/test.controller';
import { InstanceController } from './instance/instance.controller';

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
  controllers: [AuthController, TestController, InstanceController],
})
export class AppModule {}
