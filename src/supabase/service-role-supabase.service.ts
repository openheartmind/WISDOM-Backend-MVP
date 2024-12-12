import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import appConfig, { EnvironmentVariables, EnvironmentVariablesRecord } from 'src/config/app-config';


@Injectable()
export class ServiceRoleSupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService<EnvironmentVariablesRecord>) {
    const supabaseUrl = this.configService.getOrThrow<string>("SUPABASE_URL")
    const supabaseServiceKey = this.configService.getOrThrow<string>("SUPABASE_SERVICE_KEY")
    this.client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    });
  }

  getClient() {
    return this.client;
  }
}
