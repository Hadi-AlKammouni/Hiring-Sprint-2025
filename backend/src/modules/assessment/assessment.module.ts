import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AssessmentService } from '../assessment.service';
import { AssessmentController } from '../assessment.controller';

@Module({
  imports: [AiModule], // So we can inject AiService
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}
