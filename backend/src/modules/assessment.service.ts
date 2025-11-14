import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService, AiDetection } from './ai/ai.service';

interface Damage {
  id: string;
  panel: string;
  type: 'scratch' | 'dent' | 'crack';
  severity: number; // 1–5
  estimatedCost: number; // USD
}

interface AssessmentSummary {
  newDamageCount: number;
  totalEstimatedCost: number;
  severityScore: number;
}

export interface Assessment {
  id: string;
  summary: AssessmentSummary;
  damages: Damage[];
}

@Injectable()
export class AssessmentService {
  // Demo in-memory store
  private assessments = new Map<string, Assessment>();

  constructor(private readonly aiService: AiService) {}

  createMockAssessment(
    pickupImages: Express.Multer.File[] = [],
    returnImages: Express.Multer.File[] = [],
  ): Assessment {
    // 1) Call AI layer to "analyze" images
    const aiDetections: AiDetection[] = this.aiService.analyzeImages(
      pickupImages,
      returnImages,
    );

    // 2) Map AI detections to business-facing Damage objects
    const damages: Damage[] = aiDetections.map((det, idx) =>
      this.mapDetectionToDamage(det, idx),
    );

    // 3) Aggregate summary
    const id = randomUUID();
    const totalEstimatedCost = damages.reduce(
      (sum, d) => sum + d.estimatedCost,
      0,
    );
    const severityScore =
      damages.length > 0
        ? damages.reduce((sum, d) => sum + d.severity, 0) / damages.length
        : 0;

    const assessment: Assessment = {
      id,
      summary: {
        newDamageCount: damages.length,
        totalEstimatedCost,
        severityScore,
      },
      damages,
    };

    this.assessments.set(id, assessment);
    return assessment;
  }

  getMockAssessment(id: string): Assessment | null {
    return this.assessments.get(id) ?? null;
  }

  /**
   * Business logic: convert an AI detection into a Damage with
   * severity (1–5) and estimated cost based on area and type.
   */
  private mapDetectionToDamage(det: AiDetection, index: number): Damage {
    // Base severity from areaRatio
    // areaRatio ~ proportion of image covered by damage (0..1)
    let severity = 1;
    if (det.areaRatio > 0.35) {
      severity = 5;
    } else if (det.areaRatio > 0.25) {
      severity = 4;
    } else if (det.areaRatio > 0.15) {
      severity = 3;
    } else if (det.areaRatio > 0.08) {
      severity = 2;
    }

    // Adjust for confidence (if AI is very confident, bump by 1 but cap at 5)
    if (det.confidence > 0.85 && severity < 5) {
      severity += 1;
    }

    // Simple cost model per type & severity (USD)
    const baseCostPerType: Record<Damage['type'], number> = {
      scratch: 80,
      dent: 120,
      crack: 150,
    };

    const baseCost = baseCostPerType[det.type];
    // Multiply by severity and scale a bit by area
    const estimatedCost = Math.round(
      baseCost * severity * (0.8 + det.areaRatio),
    );

    return {
      id: `d-${index + 1}`,
      panel: det.panel ?? 'unknown-panel',
      type: det.type,
      severity,
      estimatedCost,
    };
  }
}
