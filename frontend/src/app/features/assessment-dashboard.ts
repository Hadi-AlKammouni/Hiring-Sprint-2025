import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Assessment, AssessmentApiService } from '../core/services/assessment-api.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-assessment-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinner,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './assessment-dashboard.html',
  styleUrls: ['./assessment-dashboard.scss'],
})
export class AssessmentDashboard {
  assessmentApiService = inject(AssessmentApiService);

  // Signals to store previews
  pickupPreviews = signal<string[]>([]);
  returnPreviews = signal<string[]>([]);

  // Optionally keep the File[] if not already in service
  pickupFiles: File[] = [];
  returnFiles: File[] = [];

  onPickupSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    // 🔹 If user cancels (no files), do nothing
    if (!files || files.length === 0) {
      return;
    }

    const newlySelected = Array.from(files);

    // Append to existing
    this.pickupFiles = [...this.pickupFiles, ...newlySelected];

    // Regenerate previews for all currently selected files
    const urls = this.pickupFiles.map((file) => URL.createObjectURL(file));
    this.pickupPreviews.set(urls);

    // Clear input value so user can re-open same dialog with same files
    input.value = '';
  }

  onReturnSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const newlySelected = Array.from(files);

    this.returnFiles = [...this.returnFiles, ...newlySelected];

    const urls = this.returnFiles.map((file) => URL.createObjectURL(file));
    this.returnPreviews.set(urls);

    input.value = '';
  }

  // Use this.pickupFiles / this.returnFiles
  createAssessment(): void {
    if (!this.pickupFiles.length || !this.returnFiles.length) {
      // show some mat-snack-bar or error signal later
      return;
    }

    this.assessmentApiService.createAssessmentWithImages(this.pickupFiles, this.returnFiles);
  }

  reset(): void {
    this.pickupFiles = [];
    this.returnFiles = [];

    this.pickupPreviews.set([]);
    this.returnPreviews.set([]);

    // Clear URLs to prevent memory leaks
    this.pickupPreviews().forEach((url) => URL.revokeObjectURL(url));
    this.returnPreviews().forEach((url) => URL.revokeObjectURL(url));

    this.assessmentApiService.resetAssessment?.();
  }

  severityClass(score: number): string {
    if (score >= 4) return 'severity-high';
    if (score >= 2) return 'severity-medium';
    return 'severity-low';
  }

  exportAssessmentAsPdf(assessment: Assessment): void {
    const element = document.getElementById('resultCard') as HTMLElement;

    if (!element) {
      return;
    }

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pageHeight - margin * 2) {
        const ratio = (pageHeight - margin * 2) / imgHeight;
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        const offsetX = (pageWidth - finalWidth) / 2;

        pdf.addImage(imgData, 'PNG', offsetX, margin, finalWidth, finalHeight);
      } else {
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      }

      const fileName = `assessment-${assessment.id}.pdf`;
      pdf.save(fileName);
    });
  }
}
