import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

export type AiDamageType = 'scratch' | 'dent' | 'crack';
export type AiStage = 'pickup' | 'return';

export interface AiBoundingBox {
  x: number; // 0–1
  y: number; // 0–1
  width: number; // 0–1
  height: number; // 0–1
}

export interface AiDetection {
  stage: AiStage;
  imageIndex: number;
  panel: string;
  type: AiDamageType;
  confidence: number;
  areaRatio: number;
  bbox?: AiBoundingBox; // optional to be safe
}

interface PythonDetection {
  panel: string;
  type: AiDamageType;
  confidence: number;
  area_ratio: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Injectable()
export class AiService {
  private readonly aiBaseUrl =
    process.env.AI_BASE_URL || 'http://127.0.0.1:8000';

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
          bbox: d.bbox,
        })),
      );
    }

    // 2) Return images
    for (let i = 0; i < returnImages.length; i++) {
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
          bbox: d.bbox,
        })),
      );
    }

    return detections;
  }

  private async callPythonService(
    stage: AiStage,
    file: Express.Multer.File,
  ): Promise<PythonDetection[]> {
    if (!file.buffer) {
      return [];
    }

    const form = new FormData();
    form.append('stage', stage);

    // ✅ send in-memory buffer as file
    form.append('image', file.buffer, {
      filename: file.originalname,
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
