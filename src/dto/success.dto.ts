import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SuccessDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if operation was successful',
  })
  @IsBoolean()
  readonly success: boolean;
}
