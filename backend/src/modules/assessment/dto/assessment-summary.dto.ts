import { ApiProperty } from '@nestjs/swagger';

export class AssessmentSummaryDto {
  @ApiProperty({
    example: 1,
    description: 'Number of new or worsened damages detected',
  })
  newDamageCount: number;

  @ApiProperty({
    example: 250,
    description: 'Total estimated repair cost in USD',
  })
  totalEstimatedCost: number;

  @ApiProperty({
    example: 4.0,
    description: 'Average severity score across damages',
  })
  severityScore: number;
}
