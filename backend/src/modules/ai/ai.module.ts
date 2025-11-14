import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AiService],
  exports: [AiService], // To be injected by other modules
})
export class AiModule {}
