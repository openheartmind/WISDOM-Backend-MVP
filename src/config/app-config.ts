import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
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

  @IsUrl({
    protocols: ['postgres', 'postgresql'],
    require_protocol: true,
    require_tld: false,
  })
  DATABASE_URL: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_KEY: string;

  @IsString()
  SUPABASE_SERVICE_KEY: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  SMTP_USER: string;

  @IsString()
  SMTP_PASS: string;

  @IsOptional()
  @IsString()
  SMTP_HOST: string;

  @IsOptional()
  @IsPort()
  SMTP_PORT: number | string;

  @IsOptional()
  @IsBoolean()
  SMTP_TLS: boolean;

  @IsOptional()
  @IsString()
  SMTP_FROM: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  SIGNUP_CONFIRM_BASE_URL: string;

  @IsString()
  SIGNUP_URL: string;

  @IsString()
  INVITE_SECRET: string;
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

export default () =>
  ({
    PORT: parseInt(process.env.PORT as string, 10) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_HOST: process.env.SMTP_HOST || 'localhost',
    SMTP_PORT: process.env.SMTP_PORT || 25,
    SMTP_TLS: process.env.SMTP_TLS
      ? process.env.SMTP_TLS.trim().toLowerCase() === 'true'
      : false,
    SMTP_FROM: process.env.SMTP_FROM || 'test@example.com',
    SIGNUP_CONFIRM_BASE_URL: process.env.SIGNUP_CONFIRM_BASE_URL,
    SIGNUP_URL: process.env.SIGNUP_URL,
    INVITE_SECRET: process.env.INVITE_SECRET,
  }) as EnvironmentVariables;
