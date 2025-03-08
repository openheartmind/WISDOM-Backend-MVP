import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPort, IsString, IsUrl, Max, Min, validateSync, } from 'class-validator';

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

export class EnvironmentVariables {

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  NODE_ENV: "development" | "production" | "test" | "provision";

  @IsOptional()
  @IsUrl({ protocols: ['postgres', 'postgresql'], require_protocol: true, require_tld: false })
  DATABASE_URL: string;

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
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: process.env.SMTP_PORT || 25,
  SMTP_TLS: process.env.SMTP_TLS ? process.env.SMTP_TLS.trim().toLowerCase() === 'true' : false,
  SMTP_FROM: process.env.SMTP_FROM || 'test@example.com'
} as EnvironmentVariables);
