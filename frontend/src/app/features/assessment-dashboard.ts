import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Assessment, AssessmentApiService, Damage } from '../core/services/assessment-api.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type DamageHighlight = { stage: 'pickup' | 'return'; imageIndex: number };
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
  highlightedDamage = signal<DamageHighlight | null>(null);

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

    // Filter out duplicates by (name, size, lastModified)
    const nonDuplicate = newlySelected.filter(
      (newFile) =>
        !this.pickupFiles.some(
          (existing) =>
            existing.name === newFile.name &&
            existing.size === newFile.size &&
            existing.lastModified === newFile.lastModified,
        ),
    );

    if (nonDuplicate.length === 0) {
      // Nothing new → no need to reset results
      input.value = '';
      return;
    }

    // Append to existing
    this.pickupFiles = [...this.pickupFiles, ...nonDuplicate];

    // Regenerate previews for all currently selected files
    const newUrls = nonDuplicate.map((file) => URL.createObjectURL(file));
    this.pickupPreviews.set([...this.pickupPreviews(), ...newUrls]);

    // Let user re-select same files again if necessary
    input.value = '';

    // Images changed → reset results
    this.onImagesChanged();
  }

  onReturnSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const newlySelected = Array.from(files);

    const nonDuplicate = newlySelected.filter(
      (newFile) =>
        !this.returnFiles.some(
          (existing) =>
            existing.name === newFile.name &&
            existing.size === newFile.size &&
            existing.lastModified === newFile.lastModified,
        ),
    );

    if (nonDuplicate.length === 0) {
      input.value = '';
      return;
    }

    this.returnFiles = [...this.returnFiles, ...nonDuplicate];

    const newUrls = nonDuplicate.map((file) => URL.createObjectURL(file));
    this.returnPreviews.set([...this.returnPreviews(), ...newUrls]);

    input.value = '';

    this.onImagesChanged();
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

  highlightDamage(stage: 'pickup' | 'return', imageIndex: number): void {
    this.highlightedDamage.set({ stage, imageIndex });
  }

  clearHighlight(): void {
    this.highlightedDamage.set(null);
  }

  isPreviewHighlighted(stage: 'pickup' | 'return', index: number): boolean {
    const h = this.highlightedDamage();
    return !!h && h.stage === stage && h.imageIndex === index;
  }

  removePickupImage(index: number): void {
    const urls = this.pickupPreviews();
    const files = this.pickupFiles;

    if (urls[index]) {
      URL.revokeObjectURL(urls[index]);
    }

    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = urls.filter((_, i) => i !== index);

    this.pickupFiles = newFiles;
    this.pickupPreviews.set(newUrls);

    this.onImagesChanged();
  }

  removeReturnImage(index: number): void {
    const urls = this.returnPreviews();
    const files = this.returnFiles;

    if (urls[index]) {
      URL.revokeObjectURL(urls[index]);
    }

    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = urls.filter((_, i) => i !== index);

    this.returnFiles = newFiles;
    this.returnPreviews.set(newUrls);

    this.onImagesChanged();
  }

  private onImagesChanged(): void {
    // clear highlight
    this.highlightedDamage.set(null);
    // clear last assessment / errors / loading
    this.assessmentApiService.resetAssessment();
  }

  getUniqueDamages(damages: Damage[]): Damage[] {
    const seen = new Set<string>();

    return damages.filter((d) => {
      const key = `${d.stage}-${d.imageIndex}-${d.panel}-${d.type}-${d.severity}-${d.estimatedCost}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
