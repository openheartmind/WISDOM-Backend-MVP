import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvironmentVariables } from 'src/config/app-config';

@Injectable()
export class SupabaseService  {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.supabaseClient = createClient(
        this.configService.get<string>('SUPABASE_URL') as string,
        this.configService.get<string>('SUPABASE_KEY') as string,
    );
  }

  getClient(): SupabaseClient {
    
    return this.supabaseClient;
  }
} 