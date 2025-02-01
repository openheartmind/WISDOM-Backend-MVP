import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'OTP token received in email' })
  @IsString()
  readonly token: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  readonly email: string;
}
export class VerifyOtpResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  @IsString()
  readonly accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  @IsString()
  readonly refreshToken: string;

  @ApiProperty({ description: 'User details' })
  readonly user: any;
}
