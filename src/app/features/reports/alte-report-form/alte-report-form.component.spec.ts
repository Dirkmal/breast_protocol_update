import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlteReportFormComponent } from './alte-report-form.component';

describe('AlteReportFormComponent', () => {
  let component: AlteReportFormComponent;
  let fixture: ComponentFixture<AlteReportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlteReportFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlteReportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
