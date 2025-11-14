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

  async createMockAssessment(
    pickupImages: Express.Multer.File[] = [],
    returnImages: Express.Multer.File[] = [],
  ): Promise<Assessment> {
    const aiDetections: AiDetection[] = await this.aiService.analyzeImages(
      pickupImages,
      returnImages,
    );

    const pickupDetections = aiDetections.filter((d) => d.stage === 'pickup');
    const returnDetections = aiDetections.filter((d) => d.stage === 'return');

    const newOrWorsenedReturnDetections = returnDetections.filter((retDet) =>
      this.isNewOrWorsenedDamage(retDet, pickupDetections),
    );

    const damages: Damage[] = newOrWorsenedReturnDetections.map((det, idx) =>
      this.mapDetectionToDamage(det, idx),
    );

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

  /**
   * Decide if a return detection represents NEW or WORSENED damage
   * compared to what was seen at pickup.
   *
   * Logic (simple but business-friendly):
   *  - If there's no pickup detection on the same panel => NEW damage.
   *  - If return area is significantly larger => WORSENED.
   *  - If damage type changed (e.g. scratch -> dent) => WORSENED.
   */
  public isNewOrWorsenedDamage(
    returnDet: AiDetection,
    pickupDetections: AiDetection[],
  ): boolean {
    const samePanelPickup = pickupDetections.filter(
      (p) => p.panel === returnDet.panel,
    );

    // No previous damage on this panel -> new damage
    if (samePanelPickup.length === 0) {
      return true;
    }

    // Consider it worsened if:
    // - area increased significantly (e.g. +20%)
    // - or type changed (scratch -> dent/crack)
    const areaIncreaseThreshold = 1.2;

    const anyWorse = samePanelPickup.some((pickup) => {
      const areaIncreased =
        returnDet.areaRatio > pickup.areaRatio * areaIncreaseThreshold;

      const typeChanged = pickup.type !== returnDet.type;

      return areaIncreased || typeChanged;
    });

    return anyWorse;
  }

  getMockAssessment(id: string): Assessment | null {
    return this.assessments.get(id) ?? null;
  }

  /**
   * Business logic: convert a RETURN-stage AI detection into a Damage with
   * severity (1–5) and estimated cost based on area and type.
   */
  public mapDetectionToDamage(det: AiDetection, index: number): Damage {
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
