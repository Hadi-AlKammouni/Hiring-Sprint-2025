import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssessmentModule } from './modules/assessment/assessment.module';

@Module({
  imports: [AssessmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
