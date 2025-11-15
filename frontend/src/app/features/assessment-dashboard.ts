// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatProgressSpinner } from '@angular/material/progress-spinner';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDividerModule } from '@angular/material/divider';
// import { Assessment, AssessmentApiService, Damage } from '../core/services/assessment-api.service';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

// type DamageHighlight = { stage: 'pickup' | 'return'; imageIndex: number };
// @Component({
//   selector: 'app-assessment-dashboard',
//   imports: [
//     CommonModule,
//     MatButtonModule,
//     MatCardModule,
//     MatProgressSpinner,
//     MatIconModule,
//     MatDividerModule,
//   ],
//   templateUrl: './assessment-dashboard.html',
//   styleUrls: ['./assessment-dashboard.scss'],
// })
// export class AssessmentDashboard {
//   assessmentApiService = inject(AssessmentApiService);

//   // Signals to store previews
//   pickupPreviews = signal<string[]>([]);
//   returnPreviews = signal<string[]>([]);
//   highlightedDamage = signal<DamageHighlight | null>(null);

//   // Optionally keep the File[] if not already in service
//   pickupFiles: File[] = [];
//   returnFiles: File[] = [];

//   onPickupSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const files = input.files;

//     // If user cancels (no files), do nothing
//     if (!files || files.length === 0) {
//       return;
//     }

//     const newlySelected = Array.from(files);

//     // Filter out duplicates by (name, size, lastModified)
//     const nonDuplicate = newlySelected.filter(
//       (newFile) =>
//         !this.pickupFiles.some(
//           (existing) =>
//             existing.name === newFile.name &&
//             existing.size === newFile.size &&
//             existing.lastModified === newFile.lastModified,
//         ),
//     );

//     if (nonDuplicate.length === 0) {
//       // Nothing new → no need to reset results
//       input.value = '';
//       return;
//     }

//     // Append to existing
//     this.pickupFiles = [...this.pickupFiles, ...nonDuplicate];

//     // Regenerate previews for all currently selected files
//     const newUrls = nonDuplicate.map((file) => URL.createObjectURL(file));
//     this.pickupPreviews.set([...this.pickupPreviews(), ...newUrls]);

//     // Let user re-select same files again if necessary
//     input.value = '';

//     // Images changed → reset results
//     this.onImagesChanged();
//   }

//   onReturnSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     const files = input.files;

//     if (!files || files.length === 0) {
//       return;
//     }

//     const newlySelected = Array.from(files);

//     const nonDuplicate = newlySelected.filter(
//       (newFile) =>
//         !this.returnFiles.some(
//           (existing) =>
//             existing.name === newFile.name &&
//             existing.size === newFile.size &&
//             existing.lastModified === newFile.lastModified,
//         ),
//     );

//     if (nonDuplicate.length === 0) {
//       input.value = '';
//       return;
//     }

//     this.returnFiles = [...this.returnFiles, ...nonDuplicate];

//     const newUrls = nonDuplicate.map((file) => URL.createObjectURL(file));
//     this.returnPreviews.set([...this.returnPreviews(), ...newUrls]);

//     input.value = '';

//     this.onImagesChanged();
//   }

//   // Use this.pickupFiles / this.returnFiles
//   createAssessment(): void {
//     if (!this.pickupFiles.length || !this.returnFiles.length) {
//       // show some mat-snack-bar or error signal later
//       return;
//     }

//     this.assessmentApiService.createAssessmentWithImages(this.pickupFiles, this.returnFiles);
//   }

//   reset(): void {
//     this.pickupFiles = [];
//     this.returnFiles = [];

//     this.pickupPreviews.set([]);
//     this.returnPreviews.set([]);

//     // Clear URLs to prevent memory leaks
//     this.pickupPreviews().forEach((url) => URL.revokeObjectURL(url));
//     this.returnPreviews().forEach((url) => URL.revokeObjectURL(url));

//     this.assessmentApiService.resetAssessment?.();
//   }

//   severityClass(score: number): string {
//     if (score >= 4) return 'severity-high';
//     if (score >= 2) return 'severity-medium';
//     return 'severity-low';
//   }

//   exportAssessmentAsPdf(assessment: Assessment): void {
//     const element = document.getElementById('resultCard') as HTMLElement;

//     if (!element) {
//       return;
//     }

//     html2canvas(element, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');

//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();

//       const margin = 10;
//       const imgWidth = pageWidth - margin * 2;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       if (imgHeight > pageHeight - margin * 2) {
//         const ratio = (pageHeight - margin * 2) / imgHeight;
//         const finalWidth = imgWidth * ratio;
//         const finalHeight = imgHeight * ratio;
//         const offsetX = (pageWidth - finalWidth) / 2;

//         pdf.addImage(imgData, 'PNG', offsetX, margin, finalWidth, finalHeight);
//       } else {
//         pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
//       }

//       const fileName = `assessment-${assessment.id}.pdf`;
//       pdf.save(fileName);
//     });
//   }

//   highlightDamage(stage: 'pickup' | 'return', imageIndex: number): void {
//     this.highlightedDamage.set({ stage, imageIndex });
//   }

//   clearHighlight(): void {
//     this.highlightedDamage.set(null);
//   }

//   isPreviewHighlighted(stage: 'pickup' | 'return', index: number): boolean {
//     const h = this.highlightedDamage();
//     return !!h && h.stage === stage && h.imageIndex === index;
//   }

//   removePickupImage(index: number): void {
//     const urls = this.pickupPreviews();
//     const files = this.pickupFiles;

//     if (urls[index]) {
//       URL.revokeObjectURL(urls[index]);
//     }

//     const newFiles = files.filter((_, i) => i !== index);
//     const newUrls = urls.filter((_, i) => i !== index);

//     this.pickupFiles = newFiles;
//     this.pickupPreviews.set(newUrls);

//     this.onImagesChanged();
//   }

//   removeReturnImage(index: number): void {
//     const urls = this.returnPreviews();
//     const files = this.returnFiles;

//     if (urls[index]) {
//       URL.revokeObjectURL(urls[index]);
//     }

//     const newFiles = files.filter((_, i) => i !== index);
//     const newUrls = urls.filter((_, i) => i !== index);

//     this.returnFiles = newFiles;
//     this.returnPreviews.set(newUrls);

//     this.onImagesChanged();
//   }

//   private onImagesChanged(): void {
//     // clear highlight
//     this.highlightedDamage.set(null);
//     // clear last assessment / errors / loading
//     this.assessmentApiService.resetAssessment();
//   }

//   getUniqueDamages(damages: Damage[]): Damage[] {
//     const seen = new Set<string>();

//     return damages.filter((d) => {
//       const key = `${d.stage}-${d.imageIndex}-${d.panel}-${d.type}-${d.severity}-${d.estimatedCost}`;
//       if (seen.has(key)) {
//         return false;
//       }
//       seen.add(key);
//       return true;
//     });
//   }

//   getDamagesForImage(assessment: Assessment, stage: 'pickup' | 'return', index: number): Damage[] {
//     // Use existing dedupe if available
//     const allDamages = this.getUniqueDamages
//       ? this.getUniqueDamages(assessment.damages)
//       : assessment.damages;

//     return allDamages.filter((d) => d.stage === stage && d.imageIndex === index && !!d.bbox);
//   }

//   boxStyle(
//     damage: Damage,
//   ): { left: string; top: string; width: string; height: string } | { [key: string]: string } {
//     if (!damage.bbox) {
//       return {};
//     }

//     const b = damage.bbox;
//     return {
//       left: `${b.x * 100}%`,
//       top: `${b.y * 100}%`,
//       width: `${b.width * 100}%`,
//       height: `${b.height * 100}%`,
//     };
//   }
// }

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

  pickupPreviews = signal<string[]>([]);
  returnPreviews = signal<string[]>([]);
  highlightedDamage = signal<DamageHighlight | null>(null);

  pickupFiles: File[] = [];
  returnFiles: File[] = [];

  onPickupSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const newlySelected = Array.from(files);

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
      input.value = '';
      return;
    }

    this.pickupFiles = [...this.pickupFiles, ...nonDuplicate];

    const newUrls = nonDuplicate.map((file) => URL.createObjectURL(file));
    this.pickupPreviews.set([...this.pickupPreviews(), ...newUrls]);

    input.value = '';
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

  createAssessment(): void {
    if (!this.pickupFiles.length || !this.returnFiles.length) {
      return;
    }

    this.assessmentApiService.createAssessmentWithImages(this.pickupFiles, this.returnFiles);
  }

  reset(): void {
    this.pickupFiles = [];
    this.returnFiles = [];

    this.pickupPreviews().forEach((url) => URL.revokeObjectURL(url));
    this.returnPreviews().forEach((url) => URL.revokeObjectURL(url));

    this.pickupPreviews.set([]);
    this.returnPreviews.set([]);

    this.assessmentApiService.resetAssessment?.();
  }

  severityClass(score: number): string {
    if (score >= 4) return 'severity-high';
    if (score >= 2) return 'severity-medium';
    return 'severity-low';
  }

  async exportAssessmentAsPdf(assessment: Assessment): Promise<void> {
    const element = document.getElementById('resultCard') as HTMLElement;

    if (!element) {
      return;
    }

    // Show loading state
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';

    try {
      // Create PDF in portrait mode with better quality
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      let yPosition = margin;

      // Capture the summary card
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add summary to first page
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);

      // Add new page for images
      pdf.addPage();
      yPosition = margin;

      // Add title for images section
      pdf.setFontSize(18);
      pdf.setTextColor(102, 126, 234);
      pdf.text('Vehicle Images with Damage Detection', margin, yPosition);
      yPosition += 10;

      // Function to add images with damage boxes
      const addImagesSection = async (
        title: string,
        images: string[],
        stage: 'pickup' | 'return',
      ) => {
        // Section title
        pdf.setFontSize(14);
        pdf.setTextColor(102, 126, 234);
        pdf.text(title, margin, yPosition);
        yPosition += 8;

        for (let i = 0; i < images.length; i++) {
          const imgUrl = images[i];

          // Check if we need a new page
          if (yPosition + 80 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          try {
            // Load image
            const img = await this.loadImage(imgUrl);

            // Calculate dimensions to fit width
            const maxImgWidth = contentWidth;
            const maxImgHeight = 70;
            let imgWidth = maxImgWidth;
            let imgHeight = (img.height * imgWidth) / img.width;

            if (imgHeight > maxImgHeight) {
              imgHeight = maxImgHeight;
              imgWidth = (img.width * imgHeight) / img.height;
            }

            // Center the image
            const xPos = margin + (contentWidth - imgWidth) / 2;

            // Create a canvas to draw image with damage boxes
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const ctx = tempCanvas.getContext('2d');

            if (ctx) {
              // Draw the image
              ctx.drawImage(img, 0, 0);

              // Draw damage boxes
              const damages = this.getDamagesForImage(assessment, stage, i);
              damages.forEach((damage) => {
                if (damage.bbox) {
                  ctx.strokeStyle = '#ff4757';
                  ctx.lineWidth = 6;
                  ctx.strokeRect(
                    damage.bbox.x * img.width,
                    damage.bbox.y * img.height,
                    damage.bbox.width * img.width,
                    damage.bbox.height * img.height,
                  );

                  // Add semi-transparent fill
                  ctx.fillStyle = 'rgba(255, 71, 87, 0.15)';
                  ctx.fillRect(
                    damage.bbox.x * img.width,
                    damage.bbox.y * img.height,
                    damage.bbox.width * img.width,
                    damage.bbox.height * img.height,
                  );
                }
              });

              // Convert canvas to image
              const processedImgData = tempCanvas.toDataURL('image/jpeg', 0.9);

              // Add to PDF
              pdf.addImage(processedImgData, 'JPEG', xPos, yPosition, imgWidth, imgHeight);

              // Add label below image
              pdf.setFontSize(10);
              pdf.setTextColor(100, 100, 100);
              const label = `${title} - Image ${i + 1}`;
              const damages_count = this.getDamagesForImage(assessment, stage, i).length;
              const damageText =
                damages_count > 0
                  ? ` (${damages_count} damage${damages_count > 1 ? 's' : ''})`
                  : '';
              pdf.text(label + damageText, margin, yPosition + imgHeight + 5);

              yPosition += imgHeight + 12;
            }
          } catch (error) {
            console.error(`Error processing image ${i}:`, error);
          }
        }

        yPosition += 5;
      };

      // Add pickup images
      await addImagesSection('Pickup Images', this.pickupPreviews(), 'pickup');

      // Add return images
      if (yPosition + 80 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      await addImagesSection('Return Images', this.returnPreviews(), 'return');

      // Save the PDF
      const fileName = `vehicle-assessment-${assessment.id}-${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      document.body.style.cursor = originalCursor;
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
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
    this.highlightedDamage.set(null);
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

  getDamagesForImage(assessment: Assessment, stage: 'pickup' | 'return', index: number): Damage[] {
    const allDamages = this.getUniqueDamages(assessment.damages);
    return allDamages.filter((d) => d.stage === stage && d.imageIndex === index && !!d.bbox);
  }

  boxStyle(
    damage: Damage,
  ): { left: string; top: string; width: string; height: string } | { [key: string]: string } {
    if (!damage.bbox) {
      return {};
    }

    const b = damage.bbox;
    return {
      left: `${b.x * 100}%`,
      top: `${b.y * 100}%`,
      width: `${b.width * 100}%`,
      height: `${b.height * 100}%`,
    };
  }
}
