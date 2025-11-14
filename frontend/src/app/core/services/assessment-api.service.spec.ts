import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AssessmentApiService, Assessment } from './assessment-api.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AssessmentApiService', () => {
  let service: AssessmentApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssessmentApiService, provideZonelessChangeDetection()],
    });

    service = TestBed.inject(AssessmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create assessment with images and update signals', () => {
    const pickupFiles: File[] = [new File(['dummy'], 'pickup.jpg', { type: 'image/jpeg' })];
    const returnFiles: File[] = [new File(['dummy2'], 'return.jpg', { type: 'image/jpeg' })];

    const mockResponse: Assessment = {
      id: 'test-id',
      summary: {
        newDamageCount: 1,
        totalEstimatedCost: 250,
        severityScore: 4,
      },
      damages: [
        {
          id: 'd-1',
          panel: 'panel-1',
          type: 'dent',
          severity: 4,
          estimatedCost: 250,
        },
      ],
    };

    service.createAssessmentWithImages(pickupFiles, returnFiles);

    const req = httpMock.expectOne('http://localhost:3000/api/assessments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();

    // flush mock response
    req.flush(mockResponse);

    // assert signals are updated
    expect(service.loading()).toBeFalse();
    expect(service.error()).toBeNull();
    expect(service.lastAssessment()).toEqual(mockResponse);
  });
});
