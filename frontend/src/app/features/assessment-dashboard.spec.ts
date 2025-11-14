import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentDashboard } from './assessment-dashboard';

describe('AssessmentDashboard', () => {
  let component: AssessmentDashboard;
  let fixture: ComponentFixture<AssessmentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
