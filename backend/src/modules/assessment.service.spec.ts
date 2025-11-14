import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentService } from './assessment.service';
import { AiService, AiDetection } from './ai/ai.service';

// Extend the real service to expose private methods for testing
class TestableAssessmentService extends AssessmentService {
  public exposeMapDetectionToDamage(det: AiDetection, index: number) {
    return this.mapDetectionToDamage(det, index);
  }

  public exposeIsNewOrWorsenedDamage(ret: AiDetection, pickup: AiDetection[]) {
    return this.isNewOrWorsenedDamage(ret, pickup);
  }
}

describe('AssessmentService', () => {
  let service: TestableAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AssessmentService,
          useFactory: (aiService: AiService) =>
            new TestableAssessmentService(aiService),
          inject: [AiService],
        },
        {
          provide: AiService,
          useValue: {
            analyzeImages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssessmentService>(
      AssessmentService,
    ) as TestableAssessmentService;
  });

  it('should map AI detection to internal Damage with correct severity & cost', () => {
    const detection: AiDetection = {
      stage: 'return',
      imageIndex: 0,
      panel: 'front-door',
      type: 'dent',
      confidence: 0.9,
      areaRatio: 0.3,
    };

    const damage = service.exposeMapDetectionToDamage(detection, 0);

    expect(damage.id).toBe('d-1');
    expect(damage.panel).toBe('front-door');
    expect(damage.type).toBe('dent');

    // Severity expected: area=0.3 => base severity 4, confidence 0.9 => +1 = 5
    expect(damage.severity).toBeGreaterThanOrEqual(4);
    expect(damage.severity).toBeLessThanOrEqual(5);

    expect(damage.estimatedCost).toBeGreaterThan(0);
  });

  it('should detect worsened damage when return area is significantly larger', () => {
    const pickup: AiDetection[] = [
      {
        stage: 'pickup',
        imageIndex: 0,
        panel: 'front-door',
        type: 'scratch',
        confidence: 0.7,
        areaRatio: 0.05,
      },
    ];

    const ret: AiDetection = {
      stage: 'return',
      imageIndex: 0,
      panel: 'front-door',
      type: 'scratch',
      confidence: 0.8,
      areaRatio: 0.2, // > 1.2× increase
    };

    const result = service.exposeIsNewOrWorsenedDamage(ret, pickup);
    expect(result).toBe(true);
  });

  it('should detect new damage when no pickup detection on that panel', () => {
    const pickup: AiDetection[] = [];

    const ret: AiDetection = {
      stage: 'return',
      imageIndex: 0,
      panel: 'rear-bumper',
      type: 'dent',
      confidence: 0.9,
      areaRatio: 0.1,
    };

    const result = service.exposeIsNewOrWorsenedDamage(ret, pickup);
    expect(result).toBe(true);
  });
});
