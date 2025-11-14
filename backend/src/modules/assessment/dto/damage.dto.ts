import { ApiProperty } from '@nestjs/swagger';

export class DamageDto {
  @ApiProperty({ example: 'd1', description: 'Unique damage identifier' })
  id: string;

  @ApiProperty({
    example: 'front-left-fender',
    description: 'Vehicle panel / location',
  })
  panel: string;

  @ApiProperty({
    example: 'dent',
    enum: ['scratch', 'dent', 'crack'],
    description: 'Type of damage detected',
  })
  type: 'scratch' | 'dent' | 'crack';

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 5,
    description: 'Severity score from 1 (low) to 5 (high)',
  })
  severity: number;

  @ApiProperty({
    example: 250,
    description: 'Estimated repair cost in USD',
  })
  estimatedCost: number;
}
