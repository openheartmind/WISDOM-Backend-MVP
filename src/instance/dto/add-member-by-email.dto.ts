import { ApiProperty } from '@nestjs/swagger';
import { roles } from '../instance.roles';
import { IsEmail, IsEnum } from 'class-validator';

export class AddMemberByEmailDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user to be added to the instance',
  })
  email: string;

  @IsEnum(roles)
  @ApiProperty({
    example: 'Manager',
    description: 'The role to be assigned to the user',
    enum: roles,
  })
  role: string;
}
