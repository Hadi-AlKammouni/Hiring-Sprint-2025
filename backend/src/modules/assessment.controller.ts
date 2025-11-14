import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import { AssessmentDto } from './assessment/dto/assessment.dto';

@ApiTags('assessments')
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Pickup and return images for vehicle condition assessment',
    schema: {
      type: 'object',
      properties: {
        pickupImages: {
          type: 'string',
          format: 'binary',
          description: 'Images taken at vehicle pickup (allow multiple)',
        },
        returnImages: {
          type: 'string',
          format: 'binary',
          description: 'Images taken at vehicle return (allow multiple)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Created assessment with damage summary',
    type: AssessmentDto,
  })
  async createMockAssessment(
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
  @ApiOkResponse({
    description: 'Get an existing assessment by id',
    type: AssessmentDto,
  })
  getMockAssessment(@Param('id') id: string): AssessmentDto | null {
    return this.assessmentService.getMockAssessment(id);
  }
}
