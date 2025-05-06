// src/contributions/dto/create-contribution.dto.ts
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContributionDto {
  @ApiProperty({ description: 'The title of the contribution' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The content of the contribution' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'The ID of the instance this contribution belongs to' })
  @IsNotEmpty()
  @IsUUID()
  instanceId: string;
}