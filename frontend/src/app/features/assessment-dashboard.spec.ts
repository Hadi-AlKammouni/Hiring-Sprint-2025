import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentDashboard } from './assessment-dashboard';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Assessment, Damage } from '../core/services/assessment-api.service';

describe('AssessmentDashboard', () => {
  let component: AssessmentDashboard;
  let fixture: ComponentFixture<AssessmentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentDashboard, HttpClientTestingModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getDamagesForImage should filter damages by stage + imageIndex and require bbox', () => {
    const damages: Damage[] = [
      {
        id: 'd1',
        panel: 'left-side-panel',
        type: 'scratch',
        severity: 2,
        estimatedCost: 100,
        stage: 'pickup',
        imageIndex: 0,
        bbox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
      },
      {
        id: 'd2',
        panel: 'right-side-panel',
        type: 'dent',
        severity: 3,
        estimatedCost: 200,
        stage: 'return',
        imageIndex: 1,
        bbox: { x: 0.2, y: 0.3, width: 0.2, height: 0.2 },
      },
      {
        id: 'd3',
        panel: 'center-side-panel',
        type: 'crack',
        severity: 4,
        estimatedCost: 300,
        stage: 'return',
        imageIndex: 1,
        // no bbox -> should be filtered out
      } as Damage,
    ];

    const assessment: Assessment = {
      id: 'a1',
      createdAt: new Date().toISOString(),
      summary: {
        newDamageCount: 3,
        totalEstimatedCost: 600,
        severityScore: 3,
      },
      damages,
    };

    const resultPickup = component.getDamagesForImage(assessment, 'pickup', 0);
    expect(resultPickup.length).toBe(1);
    expect(resultPickup[0].id).toBe('d1');

    const resultReturn = component.getDamagesForImage(assessment, 'return', 1);
    // d2 has bbox, d3 does not
    expect(resultReturn.length).toBe(1);
    expect(resultReturn[0].id).toBe('d2');
  });

  it('boxStyle should convert normalized bbox to percentage-based positioning', () => {
    const damage: Damage = {
      id: 'd1',
      panel: 'left-side-panel',
      type: 'scratch',
      severity: 2,
      estimatedCost: 100,
      stage: 'pickup',
      imageIndex: 0,
      bbox: {
        x: 0.1,
        y: 0.2,
        width: 0.3,
        height: 0.4,
      },
    };

    const style = component.boxStyle(damage);
    expect(style.left).toBe('10%');
    expect(style.top).toBe('20%');
    expect(style.width).toBe('30%');
    expect(style.height).toBe('40%');
  });
});
