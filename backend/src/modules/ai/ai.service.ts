import { Injectable } from '@nestjs/common';

// Simple internal type representing a "detected" damage from AI
export type AiDamageType = 'scratch' | 'dent' | 'crack';
export type AiStage = 'pickup' | 'return';

export interface AiDetection {
  stage: AiStage; // pickup or return
  imageIndex: number; // index within that stage
  panel: string;
  type: AiDamageType;
  confidence: number;
  areaRatio: number; // 0..1 proportion of image
}

@Injectable()
export class AiService {
  analyzeImages(
    pickupImages: Express.Multer.File[],
    returnImages: Express.Multer.File[],
  ): AiDetection[] {
    const detections: AiDetection[] = [];

    // 1) "Baseline" detections at pickup
    pickupImages.forEach((file, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const sizeKb = file.size / 1024;
      const areaRatio = Math.min(0.25, Math.max(0.03, sizeKb / 7000)); // smaller baseline area
      const confidence = Math.min(0.9, 0.6 + Math.random() * 0.3);

      detections.push({
        stage: 'pickup',
        imageIndex: index,
        panel: `panel-${index + 1}`,
        type: 'scratch', // assume smaller damage at pickup
        confidence,
        areaRatio,
      });
    });

    // 2) "Observed" detections at return (bigger / new damages)
    returnImages.forEach((file, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const sizeKb = file.size / 1024;
      const areaRatio = Math.min(0.45, Math.max(0.05, sizeKb / 5000)); // can be larger
      const confidence = Math.min(0.95, 0.7 + Math.random() * 0.25);

      // For demo: alternate between scratch and dent
      const type: AiDamageType = index % 2 === 0 ? 'dent' : 'scratch';

      detections.push({
        stage: 'return',
        imageIndex: index,
        panel: `panel-${index + 1}`,
        type,
        confidence,
        areaRatio,
      });
    });

    return detections;
  }
}
