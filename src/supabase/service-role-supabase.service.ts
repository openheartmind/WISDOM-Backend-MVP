import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '../config/config.service';

@Injectable()
export class ServiceRoleSupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const { supabaseUrl, supabaseServiceKey } = this.configService;

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
