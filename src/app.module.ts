import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { validate } from 'class-validator';
import { SupabaseModule } from 'nestjs-supabase-js';
import appConfig,{validate} from './config/app-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
      load:[appConfig],
    }),
    SupabaseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory(configService: ConfigService) {
        console.log(configService.get('PORT'));
        return {
          supabaseKey: 'SUPABASE_KEY',
          supabaseUrl: 'jk',
        };
      },
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
