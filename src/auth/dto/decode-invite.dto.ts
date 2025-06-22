import { ApiProperty } from '@nestjs/swagger';

export class DecodeInviteResponseDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address from the invite token',
  })
  email: string;

  @ApiProperty({
    example: '2024-05-27T18:35:55.000Z',
    description: 'When the token expires',
  })
  expiresAt: string;
} 