// src/contributions/dto/update-contribution.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateContributionDto } from './create-contribution.dto';

export class UpdateContributionDto extends PartialType(CreateContributionDto) {}