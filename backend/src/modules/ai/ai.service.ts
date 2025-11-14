import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

export type AiDamageType = 'scratch' | 'dent' | 'crack';
export type AiStage = 'pickup' | 'return';

export interface AiDetection {
  stage: AiStage;
  imageIndex: number;
  panel: string;
  type: AiDamageType;
  confidence: number;
  areaRatio: number;
}

interface PythonDetection {
  panel: string;
  type: AiDamageType;
  confidence: number;
  area_ratio: number;
}

@Injectable()
export class AiService {
  private readonly aiBaseUrl = 'http://127.0.0.1:8000';

  constructor(private readonly http: HttpService) {}

  /**
   * Calls the external Python AI service for each pickup and return image
   * and normalizes the result into AiDetection[].
   */
  async analyzeImages(
    pickupImages: Express.Multer.File[] = [],
    returnImages: Express.Multer.File[] = [],
  ): Promise<AiDetection[]> {
    const detections: AiDetection[] = [];

    // 1) Pickup images
    for (let i = 0; i < pickupImages.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const file = pickupImages[i];
      if (!file) continue;

      const pythonDets = await this.callPythonService('pickup', file);

      detections.push(
        ...pythonDets.map((d) => ({
          stage: 'pickup' as const,
          imageIndex: i,
          panel: d.panel ?? `panel-${i + 1}`,
          type: d.type,
          confidence: d.confidence,
          areaRatio: d.area_ratio,
        })),
      );
    }

    // 2) Return images
    for (let i = 0; i < returnImages.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const file = returnImages[i];
      if (!file) continue;

      const pythonDets = await this.callPythonService('return', file);

      detections.push(
        ...pythonDets.map((d) => ({
          stage: 'return' as const,
          imageIndex: i,
          panel: d.panel ?? `panel-${i + 1}`,
          type: d.type,
          confidence: d.confidence,
          areaRatio: d.area_ratio,
        })),
      );
    }

    console.log('detections: ', detections);
    return detections;
  }

  private async callPythonService(
    stage: AiStage,
    file: Express.Multer.File,
  ): Promise<PythonDetection[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!file.buffer) {
      return [];
    }

    const form = new FormData();
    form.append('stage', stage);

    // ✅ send in-memory buffer as file
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    form.append('image', file.buffer, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      filename: file.originalname,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      contentType: file.mimetype,
    });

    const response = await firstValueFrom(
      this.http.post<{ detections: PythonDetection[] }>(
        `${this.aiBaseUrl}/detect-damage`,
        form,
        {
          headers: form.getHeaders(),
        },
      ),
    );

    return response.data?.detections ?? [];
  }
}
