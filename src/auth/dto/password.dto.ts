import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class PasswordDto {
  @ApiProperty({ description: 'Desired user password' })
  @IsString()
  readonly password: string
}

export class InitRecoverPasswordDto {
  @ApiProperty({
    description: 'Email for user account to recover',
    example: 'user@example.com'
  })
  @IsEmail()
  readonly email: string;
}

export class RecoveryTokenAuthDto extends InitRecoverPasswordDto {
  @ApiProperty({ description: 'Secret token to authorize recovery attempt' })
  @IsString()
  readonly token: string;
}
