import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface Damage {
  id: string;
  panel: string;
  type: 'scratch' | 'dent' | 'crack';
  severity: number; // 1–5
  estimatedCost: number; // simple number for now
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

  createMockAssessment(
    pickupImages: Express.Multer.File[] = [],
    returnImages: Express.Multer.File[] = [],
  ): Assessment {
    // For debugging only
    // console.log('pickupImages count:', pickupImages.length);
    // console.log('returnImages count:', returnImages.length);

    const id = randomUUID();
    const damages: Damage[] = [
      {
        id: 'd1',
        panel: 'front-left-fender',
        type: 'dent',
        severity: 4,
        estimatedCost: 250,
      },
    ];

    const totalEstimatedCost = damages.reduce(
      (sum, d) => sum + d.estimatedCost,
      0,
    );
    const severityScore =
      damages.reduce((sum, d) => sum + d.severity, 0) / damages.length;

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
}
