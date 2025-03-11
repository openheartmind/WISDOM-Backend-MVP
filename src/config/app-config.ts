import { plainToInstance } from 'class-transformer';
import {
  IsOptional,
  IsPort,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsPort()
  PORT: number | string;

  @IsOptional()
  @IsString()
  NODE_ENV: 'development' | 'production' | 'test' | 'provision';

  @IsUrl({ protocols: ['postgres', 'postgresql'], require_protocol: true, require_tld: false })
  DATABASE_URL: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_KEY: string;

  @IsString()
  SUPABASE_SERVICE_KEY: string;

  @IsString()
  JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export default () => ({
  PORT: parseInt(process.env.PORT as string, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
}) as EnvironmentVariables;
