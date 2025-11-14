import { Injectable } from '@nestjs/common';

// Simple internal type representing a "detected" damage from AI
export type AiDamageType = 'scratch' | 'dent' | 'crack';

export interface AiDetection {
  imageIndex: number; // which image (in returnImages) this came from
  panel: string; // very rough label; later we can infer from bbox/metadata
  type: AiDamageType;
  confidence: number; // 0..1
  areaRatio: number; // 0..1 ~ proportion of image area
}

@Injectable()
export class AiService {
  /**
   * Mock AI analysis.
   * Later this can call a Python microservice or external model.
   */
  analyzeImages(
    pickupImages: Express.Multer.File[],
    returnImages: Express.Multer.File[],
  ): AiDetection[] {
    // For now, ignore pickupImages and pretend each return image has
    // one "dent" with random severity-like properties.
    // This keeps the architecture ready for a real model.
    const detections: AiDetection[] = [];

    returnImages.forEach((file, index) => {
      // a silly heuristic: use file size to vary area/confidence a bit
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const sizeKb = file.size / 1024;
      const areaRatio = Math.min(0.4, Math.max(0.05, sizeKb / 5000)); // 5%–40%
      const confidence = Math.min(0.95, 0.6 + Math.random() * 0.4);

      detections.push({
        imageIndex: index,
        panel: 'unknown-panel',
        type: 'dent',
        confidence,
        areaRatio,
      });
    });

    console.log(detections);

    return detections;
  }
}
