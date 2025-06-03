import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuccessDto } from 'src/dto/success.dto';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: 'password', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiPropertyOptional({
    example: 'Dipanshu',
    description: 'The full name of the user',
  })
  @IsOptional()
  @IsString()
  readonly displayName?: string;
}

export class SignUpResponseDto extends SuccessDto {}

export class SignUpConfirmDto {
  @ApiProperty({ description: 'Token received from confrimation email' })
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  // support OTP?
}
