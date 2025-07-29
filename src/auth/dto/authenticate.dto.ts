import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@supabase/auth-js';

export class AuthenticateDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  readonly email: string;
}

export class AuthenticateResponseDto {
  @ApiProperty({
    description: 'Supabase Auth user',
  })
  readonly user: User;

  @ApiProperty({
    description: 'JWT'
  })
  readonly accessToken: string;

  @ApiProperty({
    description: 'Indicates authentication succeeded'
  })
  readonly success: boolean;
}
