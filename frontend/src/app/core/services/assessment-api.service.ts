import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Damage {
  id: string;
  panel: string;
  type: 'scratch' | 'dent' | 'crack';
  severity: number;
  estimatedCost: number;
  stage: 'pickup' | 'return';
  imageIndex: number;
  bbox?: {
    x: number; // 0–1
    y: number; // 0–1
    width: number; // 0–1
    height: number; // 0–1
  };
}

export interface AssessmentSummary {
  newDamageCount: number;
  totalEstimatedCost: number;
  severityScore: number;
}

export interface Assessment {
  id: string;
  createdAt: string;
  summary: AssessmentSummary;
  damages: Damage[];
}

@Injectable({
  providedIn: 'root',
})
export class AssessmentApiService {
  private http = inject(HttpClient);

  // TODO: later move to environment file
  private readonly baseUrl = 'http://localhost:3000';

  loading = signal(false);
  lastAssessment = signal<Assessment | null>(null);
  error = signal<string | null>(null);

  //  Kept for testing
  createMockAssessment() {
    this.loading.set(true);
    this.error.set(null);

    this.http.post<Assessment>(`${this.baseUrl}/api/assessments`, {}).subscribe({
      next: (assessment) => {
        this.lastAssessment.set(assessment);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to contact backend');
        this.loading.set(false);
      },
    });
  }

  // Send pickup & return images via multipart/form-data
  createAssessmentWithImages(pickupFiles: File[], returnFiles: File[]) {
    const formData = new FormData();

    pickupFiles.forEach((file) => {
      formData.append('pickupImages', file);
    });

    returnFiles.forEach((file) => {
      formData.append('returnImages', file);
    });

    this.loading.set(true);
    this.error.set(null);
    this.lastAssessment.set(null);

    this.http.post<Assessment>(`${this.baseUrl}/api/assessments`, formData).subscribe({
      next: (assessment) => {
        this.lastAssessment.set(assessment);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to contact backend');
        this.loading.set(false);
        this.error.set('Failed to create assessment with images');
      },
    });
  }

  resetAssessment(): void {
    this.lastAssessment.set(null);
    this.error.set(null);
    this.loading.set(false);
  }
}
