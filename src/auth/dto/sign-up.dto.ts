import { IsBoolean, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuccessDto } from 'src/dto/success.dto';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'password', description: 'User password' })
  @IsString()
  readonly password: string;

  @ApiProperty({ example: 'dipanshuhappy', description: 'The username is the public identifier of a user' })
  @IsString()
  readonly username: string;

  @ApiPropertyOptional({ example: 'Dipanshu', description: 'The full name of the user' })
  @IsOptional()
  @IsString()
  readonly fullName?: string; 
}

export class SignUpResponseDto extends SuccessDto  { 
}