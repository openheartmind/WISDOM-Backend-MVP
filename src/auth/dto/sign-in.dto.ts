import { IsBoolean, IsEmail, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuccessDto } from 'src/dto/success.dto';
import { users } from 'src/database/schema';

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'password', description: 'User password' })
  @IsString()
  readonly password: string; 
}

export class SignInResponseDto extends SuccessDto  {
    @ApiProperty({ description: 'Access token for the user' })
    @IsString()
    readonly accessToken: string; 

    @ApiProperty({ description: 'User'})
    @IsObject()
    readonly user: typeof users.$inferSelect;
}