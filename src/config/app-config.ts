import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';


export class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsOptional()
  NODE_ENV: 'development' | 'production' | 'test';

  @IsUrl()
  @IsOptional()
  SUPABASE_URL: string;

  @IsString()
  @IsOptional()
  SUPABASE_KEY: string;

  @IsString()
  @IsOptional()
  SUPABASE_SERVICE_KEY: string;
}

type ClassToRecord<T> = {
    [K in keyof T]: T[K];
  };
  
export type EnvironmentVariablesRecord = ClassToRecord<EnvironmentVariables>;

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
    PORT: parseInt(process.env.PORT, 10) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  }) as EnvironmentVariables;
