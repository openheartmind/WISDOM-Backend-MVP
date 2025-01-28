import { IsBoolean, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthenticateDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  readonly email: string;
 
}

export class AuthenticateResponseDto {
  @ApiProperty({ example: true, description: 'Indicates if authentication was successful' })
  @IsBoolean()
  readonly success: boolean;
}