import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Damage {
  id: string;
  panel: string;
  type: 'scratch' | 'dent' | 'crack';
  severity: number;
  estimatedCost: number;
}

export interface AssessmentSummary {
  newDamageCount: number;
  totalEstimatedCost: number;
  severityScore: number;
}

export interface Assessment {
  id: string;
  summary: AssessmentSummary;
  damages: Damage[];
}

@Injectable({
  providedIn: 'root',
})
export class AssessmentApiService {
  private http = inject(HttpClient);

  loading = signal(false);
  lastAssessment = signal<Assessment | null>(null);
  error = signal<string | null>(null);

  createMockAssessment() {
    this.loading.set(true);
    this.error.set(null);

    this.http.post<Assessment>('http://localhost:3000/api/assessments', {}).subscribe({
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
}
