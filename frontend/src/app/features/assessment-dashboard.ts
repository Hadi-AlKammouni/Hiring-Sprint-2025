import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssessmentApiService } from '../core/services/assessment-api.service';

@Component({
  selector: 'app-assessment-dashboard',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './assessment-dashboard.html',
  styleUrls: ['./assessment-dashboard.scss'],
})
export class AssessmentDashboard {
  api = inject(AssessmentApiService);

  onCreateAssessment() {
    this.api.createMockAssessment();
  }
}
