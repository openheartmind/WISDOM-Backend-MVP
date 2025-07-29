import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ProfileUpdateDto {
  @ApiPropertyOptional({ example: 'Johnny', description: 'Display name' })
  @IsString()
  @IsOptional()
  readonly displayName?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @ApiPropertyOptional({ example: '0400000000', description: 'Phone number' })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiPropertyOptional({ example: 'Australia', description: 'Country' })
  @IsOptional()
  @IsString()
  readonly country?: string;
}
