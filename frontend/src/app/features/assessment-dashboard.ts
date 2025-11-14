import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AssessmentApiService } from '../core/services/assessment-api.service';

@Component({
  selector: 'app-assessment-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './assessment-dashboard.html',
  styleUrls: ['./assessment-dashboard.scss'],
})
export class AssessmentDashboard {
  api = inject(AssessmentApiService);

  // Signals to hold selected files
  pickupFiles = signal<File[]>([]);
  returnFiles = signal<File[]>([]);

  onPickupFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.pickupFiles.set([]);
      return;
    }
    this.pickupFiles.set(Array.from(input.files));
  }

  onReturnFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.returnFiles.set([]);
      return;
    }
    this.returnFiles.set(Array.from(input.files));
  }

  onCreateAssessment() {
    const pickup = this.pickupFiles();
    const ret = this.returnFiles();

    if (!pickup.length || !ret.length) {
      this.api.error.set('Please select pickup and return images.');
      return;
    }

    this.api.createAssessmentWithImages(pickup, ret);
  }

  onReset() {
    this.pickupFiles.set([]);
    this.returnFiles.set([]);
    this.api.lastAssessment.set(null);
    this.api.error.set(null);
  }
}
