import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  AxillaryProcedures,
  IHCStatus,
  InSituCarcinoma,
  InvasiveCarcinomaTypes,
  InvasiveGrades,
  Laterality,
  Lympho,
  Report,
  SkeletalMuscle,
  SkinInvolvement,
  SpecimenTypes,
  SurgicalMargins,
  TumourExtent,
} from '../../../core/models/report.model';
import { ReportsService } from '../../../core/services/data.service';
import { DynamicFormControlService } from '../../../core/services/dynamic-form-control.service';
import { ControlTypes, DynamicControl } from '../../../models/dynamic-control';
import { DynamicFormControlComponent } from '../../../shared/components/dynamic-form-control/dynamic-form-control.component';
import { MaterialModule } from '../../../shared/material.module';

interface Option {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-report-update',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    MatExpansionModule
  ],
  templateUrl: './report-update.component.html',
  styleUrl: './report-update.component.scss',
})
export class ReportUpdateComponent implements OnInit {
  reportForm: FormGroup;
  reportId: string = '';
  loading = false;
  isEditMode = false;

  // Make enums available to template
  specimenTypes = SpecimenTypes;
  axillaryProcedures = AxillaryProcedures;
  inSituCarcinoma = InSituCarcinoma;
  laterality = Laterality;
  invasiveCarcinomaTypes = InvasiveCarcinomaTypes;
  invasiveGrades = InvasiveGrades;
  tumourExtent = TumourExtent;
  lympho = Lympho;
  surgicalMargins = SurgicalMargins;
  skinInvolvement = SkinInvolvement;
  skeletalMuscle = SkeletalMuscle;
  ihcStatus = IHCStatus;

  // Get enum keys for dropdowns
  specimenTypeKeys = Object.keys(SpecimenTypes);
  axillaryProcedureKeys = Object.keys(AxillaryProcedures);
  lateralityKeys = Object.keys(Laterality);
  invasiveCarcinomaTypeKeys = Object.keys(InvasiveCarcinomaTypes);
  invasiveGradeKeys = Object.keys(InvasiveGrades);
  tumourExtentKeys = Object.keys(TumourExtent);
  lymphoKeys = Object.keys(Lympho);
  surgicalMarginKeys = Object.keys(SurgicalMargins);
  skinInvolvementKeys = Object.keys(SkinInvolvement);
  skeletalMuscleKeys = Object.keys(SkeletalMuscle);
  ihcStatusKeys = Object.keys(IHCStatus);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportsService,
    private snackBar: MatSnackBar
  ) {
    this.reportForm = this.createForm();
  }

  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Report ID:', this.reportId);
    if (this.reportId) {
      this.isEditMode = true;
      this.loadReport();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Initial Details
      initial_details: this.fb.group({
        patient_id: [''],
        hospital_number: [''],
        histology_number: ['', Validators.required],
        referring_hospital: [''],
        referring_clinician: [''],
        reporting_date: [''],
        side: [''],
        date_typed: [''],
        typed_by: ['']
      }),

      // Macroscopy
      macroscopy: this.fb.group({
        specimen_type: this.fb.group({
          core_needle_biopsy: [false],
          wide_local_excision: [false],
          mastectomy: [false],
          open_biopsy: [false],
          segmental_excision: [false],
          wide_bore_needle_biopsy: [false]
        }),
        specimen_dimensions: this.fb.group({
          weight: [0, [Validators.required, Validators.min(0)]],
          length: [0, [Validators.required, Validators.min(0)]],
          width: [0, [Validators.required, Validators.min(0)]],
          height: [0, [Validators.required, Validators.min(0)]]
        }),
        axillary_procedure: this.fb.group({
          no_lymph_node_procedure: [false],
          axillary_node_sample: [false],
          sentinel_node_biopsy: [false],
          axillary_node_clearance: [false],
          intrammary_node: [false]
        })
      }),

      // Microscopy
      microscopy: this.fb.group({
        in_situ_carcinoma: this.fb.group({
          ductal_carcinoma_in_situ: [0, [Validators.required, Validators.min(0)]],
          lobular_carcinoma_in_situ: [false],
          paget_disease: [false],
          microinvasion: [false]
        }),
        invasive_carcinoma: this.fb.group({
          ic_present: [false],
          invasive_tumor_size: [0],
          whole_tumor_size: [0],
          ic_type: [''],
          invasive_grade: [''],
          sbr_score: [0],
          tumour_extent: [''],
          lympho_vascular_invasion: [''],
          site_of_other_nodes: ['']
        }),
        axillary_node: this.fb.group({
          an_present: [false],
          total_number: [0],
          number_positive: [0]
        }),
        margin: this.fb.group({
          excision_margins: ['', Validators.required],
          skin_involvement: [''],
          nipple_involvement: [false],
          skeletal_muscle_involvement: [''],
          surgical_margins: ['']
        }),
        surgical_margins_actual: this.fb.group({
          superior: [false],
          inferior: [false],
          anterior: [false],
          posterior: [false],
          lateral: [false],
          medial: [false]
        }),
        pathological_staging: this.fb.group({
          not_applicable: [false],
          pt: [0, [Validators.required, Validators.min(0)]],
          n: [0, [Validators.required, Validators.min(0)]],
          m: [0, [Validators.required, Validators.min(0)]]
        })
      }),

      // IHC
      ihc: this.fb.group({
        oestrogen_receptor_status: ['', Validators.required],
        pr: ['', Validators.required],
        her2: ['', Validators.required],
        or_quick_allred_score: [0, [Validators.required, Validators.min(0), Validators.max(8)]],
        pr_quick_allred_score: [0, [Validators.required, Validators.min(0), Validators.max(8)]]
      }),

      // Pathologist Report
      pathologist_report: this.fb.group({
        final_diagnosis: ['', Validators.required],
        comment: [''],
        consultant_pathologist: ['', Validators.required],
        date_of_request: [''],
        date_received: [''],
        date_reviewed: ['']
      })
    });
  }

  private loadReport(): void {
    this.loading = true;
    this.reportService.getReport(this.reportId).subscribe({
      next: (report: Report) => {
        console.log('Report loaded:', report);
        this.reportForm.patchValue(report);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.snackBar.open('Error loading report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      this.loading = true;
      const formValue = this.reportForm.value;
      
      // Add timestamps
      if (this.isEditMode) {
        formValue.updated_at = new Date().toISOString();
      } else {
        formValue.created_at = new Date().toISOString();
        formValue.updated_at = new Date().toISOString();
      }

      // const saveOperation = this.isEditMode 
      //   ? this.reportService.updateReport(this.reportId, formValue)
      //   : this.reportService.createReport(formValue);

      this.reportService.updateReport(this.reportId, formValue).subscribe({
        next: (updatedReport) => {
          this.loading = false;
          const message = this.isEditMode ? 'Report updated successfully' : 'Report created successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/reports']);
        },
        error: (error) => {
          console.error('Error saving report:', error);
          this.loading = false;
          const message = this.isEditMode ? 'Error updating report' : 'Error creating report';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched(this.reportForm);
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/reports']);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.reportForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.reportForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    }
    return '';
  }

  // Helper method to get enum display value
  getEnumDisplayValue(enumObj: any, key: string): string {
    return enumObj[key] || key;
  }
}
