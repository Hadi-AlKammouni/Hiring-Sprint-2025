import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [AssessmentModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
