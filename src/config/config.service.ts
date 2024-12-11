import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get port() {
    return this.configService.get<number>('port');
  }

  get supabaseUrl() {
    return this.configService.get<string>('supabase.url');
  }

  get supabaseKey() {
    return this.configService.get<string>('supabase.key');
  }

  get supabaseServiceKey() {
    return this.configService.get<string>('supabase.serviceKey');
  }
}
