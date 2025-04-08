import { ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  roleId: number;
  @ApiPropertyOptional()
  instanceId: string;
  userId: string;
}
