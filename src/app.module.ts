import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig, { validate } from './config/app-config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { InstanceModule } from './instance/instance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      load: [appConfig],
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    DatabaseModule,
    AuthModule,
    InstanceModule
  ],
  controllers: [],
})
export class AppModule {}
