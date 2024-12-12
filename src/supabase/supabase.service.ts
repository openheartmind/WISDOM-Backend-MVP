import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { EnvironmentVariables } from 'src/config/app-config';
// scoping to request because of how we create the client: we may append auth header

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private client: SupabaseClient;

  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    @Inject(REQUEST) private request: Request,
  ) {}

  getClient() {
    if (!this.client) {
      let headers: Record<string, string> | undefined;
      const authHeader = this.request.header('authorization');
      if (authHeader) {
        headers = { Authorization: authHeader };
      }

      const supabaseKey = this.configService.getOrThrow<string>("SUPABASE_KEY");
      const supabaseUrl = this.configService.getOrThrow<string>("SUPABASE_URL");
      
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers,
        },
      });
    }

    return this.client;
  }
}
