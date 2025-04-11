import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({
    example: '0',
    description: 'The id of the role to be assigned to the user',
  })
  roleId: number;
  @ApiPropertyOptional()
  instanceId: string;
  @ApiProperty({
    example: '',
    description: 'The id of the user to be added to instance',
  })
  userId: string;
}
