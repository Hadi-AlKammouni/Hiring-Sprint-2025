import { Controller, Post, Get, Param } from '@nestjs/common';
import { AssessmentService } from './assessment.service';

@Controller('api/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  // POST /api/assessments
  @Post()
  createMockAssessment() {
    return this.assessmentService.createMockAssessment();
  }

  // GET /api/assessments/:id
  @Get(':id')
  getMockAssessment(@Param('id') id: string) {
    return this.assessmentService.getMockAssessment(id);
  }
}
