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

  @ApiProperty({ example: 'Johnny', description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  readonly displayName: string;
  
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @ApiPropertyOptional({ example: '0400000000', description: 'Phone number' })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiPropertyOptional({ example: 'Australia', description: 'Country' })
  @IsOptional()
  @IsString()
  readonly country?: string;
}

export class SignUpResponseDto extends SuccessDto {}
