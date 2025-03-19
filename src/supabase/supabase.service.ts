import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvironmentVariables } from 'src/config/app-config';

const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
};

@Injectable()
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  private serviceRoleClient: SupabaseClient;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.supabaseClient = createSupabaseClient(
      this.configService.get<string>('SUPABASE_URL') as string,
      this.configService.get<string>('SUPABASE_KEY') as string,
    );
    this.serviceRoleClient = createSupabaseClient(
      this.configService.get<string>('SUPABASE_URL') as string,
      this.configService.get<string>('SUPABASE_SERVICE_KEY') as string,
    );
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  getServiceClient() {
    return this.serviceRoleClient;
  }
}
