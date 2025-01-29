

import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Max, Min, validateSync, } from 'class-validator';

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
  @IsString()
  DATABASE_URL: string;

 
  @IsString()
  SUPABASE_URL: string;

 
  @IsString()
  SUPABASE_KEY: string;

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
    PORT: parseInt(process.env.PORT as string, 10) || 3000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,

} as EnvironmentVariables);
  