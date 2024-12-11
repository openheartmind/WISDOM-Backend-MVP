import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ConfigService } from 'src/config/config.service';
import { ServiceRoleSupabaseService } from './service-role-supabase.service';

@Module({
  providers: [ConfigService, SupabaseService, ServiceRoleSupabaseService],
  exports: [SupabaseService, ServiceRoleSupabaseService],
})
export class SupabaseModule {}
