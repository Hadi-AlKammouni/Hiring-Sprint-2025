import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AssessmentService } from './assessment.service';

@Controller('api/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pickupImages', maxCount: 10 },
      { name: 'returnImages', maxCount: 10 },
    ]),
  )
  createMockAssessment(
    @UploadedFiles()
    files: {
      pickupImages?: Express.Multer.File[];
      returnImages?: Express.Multer.File[];
    },
  ) {
    const pickup = files?.pickupImages ?? [];
    const ret = files?.returnImages ?? [];

    return this.assessmentService.createMockAssessment(pickup, ret);
  }

  @Get(':id')
  getMockAssessment(@Param('id') id: string) {
    return this.assessmentService.getMockAssessment(id);
  }
}
