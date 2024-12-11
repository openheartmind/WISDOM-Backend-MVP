import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { ConfigService } from '../config/config.service';

// scoping to request because of how we create the client: we may append auth header

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private client: SupabaseClient;

  constructor(
    private configService: ConfigService,
    @Inject(REQUEST) private request: Request,
  ) {}

  getClient() {
    if (!this.client) {
      let headers: Record<string, string> | undefined;
      const authHeader = this.request.header('authorization');
      if (authHeader) {
        headers = { Authorization: authHeader };
      }

      const { supabaseUrl, supabaseKey } = this.configService;

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
