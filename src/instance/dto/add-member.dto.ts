import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { roles } from '../instance.roles';
import { IsEnum } from 'class-validator';

export class AddMemberDto {
  @IsEnum(roles)
  @ApiProperty({
    example: 'Manager',
    description: 'The id of the role to be assigned to the user',
    enum: roles,
  })
  role: string;
  @ApiPropertyOptional()
  instanceId: string;
  @ApiProperty({
    example: '',
    description: 'The id of the user to be added to instance',
  })
  userId: string;
}
