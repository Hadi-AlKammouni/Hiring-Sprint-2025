import { ApiProperty } from '@nestjs/swagger';
import { AssessmentSummaryDto } from './assessment-summary.dto';
import { DamageDto } from './damage.dto';

export class AssessmentDto {
  @ApiProperty({
    example: '5d3b3c26-1b8a-4ef8-9b58-bf7e7aa0d623',
    description: 'Assessment unique identifier',
  })
  id: string;

  @ApiProperty({ type: AssessmentSummaryDto })
  summary: AssessmentSummaryDto;

  @ApiProperty({ type: () => [DamageDto] })
  damages: DamageDto[];
}
