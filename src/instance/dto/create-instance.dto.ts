import { ApiProperty } from '@nestjs/swagger';

export class CreateInstanceDto {
  @ApiProperty({
    example: 'Conference',
    description: 'The title of the instance',
  })
  title: string;

  @ApiProperty({
    example: 'This is an instance for a conference',
    description: 'Full description of instance',
  })
  description: string;

  createdBy?: string;
}
