import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

import { ServiceRoleSupabaseService } from './service-role-supabase.service';

@Module({
  providers: [SupabaseService, ServiceRoleSupabaseService],
  exports: [SupabaseService, ServiceRoleSupabaseService],
})
export class SupabaseModule {}
