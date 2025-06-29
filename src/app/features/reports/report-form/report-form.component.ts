import { v4 as uuidV4 } from 'uuid';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
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
  selector: 'app-report-form',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    DynamicFormControlComponent,
  ],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.scss',
})
export class ReportFormComponent implements OnInit {
  report = new Report();

  detailsForm!: FormGroup;
  macroscopyForm!: FormGroup;
  microscopyForm!: FormGroup;
  ihcForm!: FormGroup;
  pathologistForm!: FormGroup;
  currentStep = 0;

  // sub-forms for macroscopy
  specimen_typeSF!: FormGroup;
  specimen_dimSF!: FormGroup;
  axillary_proSF!: FormGroup;

  // sub-forms for microscopy
  in_situSF!: FormGroup;
  invasive_carcinomaSF!: FormGroup;
  axillary_nodeSF!: FormGroup;
  marginSF!: FormGroup;
  surgical_marginSF!: FormGroup;
  pathological_stagingSF!: FormGroup;

  //options for select form-controls
  specimen_type_options: string[] = Object.values(SpecimenTypes);
  axillary_procedure_options: string[] = Object.values(AxillaryProcedures);
  in_situ_carcinoma_options: string[] = Object.values(InSituCarcinoma);
  laterality_options: string[] = Object.values(Laterality);
  invasive_carcinoma_options: string[] = Object.values(InvasiveCarcinomaTypes);
  invasive_grades_options: string[] = Object.values(InvasiveGrades);
  tumor_extent_options: string[] = Object.values(TumourExtent);
  lympho_options: string[] = Object.values(Lympho);
  skin_involvement_options: string[] = Object.values(SkinInvolvement);
  skeletal_options: string[] = Object.values(SkeletalMuscle);
  margins: string[] = Object.values(SurgicalMargins);
  ihc_options: string[] = Object.values(IHCStatus);

  // patients: Option[] = [{ value: '1', viewValue: 'Kamaldeen Samaila' }];
  // hospitals: Option[] = [{ value: '1', viewValue: 'Kamal Hospital' }];
  histologic_types: Option[] = [
    {
      value: 'Invasive Ductal Carcinoma',
      viewValue: 'Invasive Ductal Carcinoma',
    },
    {
      value: 'Invasive Lobular Carcinoma',
      viewValue: 'Invasive Lobular Carcinoma',
    },
    { value: 'Tubular Carcinoma', viewValue: 'Tubular Carcinoma' },
    { value: 'Mucinous Carcinoma', viewValue: 'Mucinous Carcinoma' },
    { value: 'Papillary Carcinoma', viewValue: 'Papillary Carcinoma' },
    { value: 'Cribriform Carcinoma', viewValue: 'Cribriform Carcinoma' },
    { value: 'Metaplastic Carcinoma', viewValue: 'Metaplastic Carcinoma' },
    { value: 'Apocrine Carcinoma', viewValue: 'Apocrine Carcinoma' },
  ];

  detail_controls = [
    new DynamicControl({
      label: 'Patient Name',
      name: 'patient_id',
      required: true,
    }),
    new DynamicControl({
      name: 'hospital_number',
      required: true,
      // controlType: ControlTypes.SELECT,
      // options: this.hospitals,
    }),
    new DynamicControl({ name: 'histology_number', required: true }),
    new DynamicControl({ name: 'referring_hospital', required: true }),
    new DynamicControl({ name: 'referring_clinician', required: true }),
    new DynamicControl({
      controlType: ControlTypes.DATE,
      name: 'reporting_date',
      required: true,
    }),
    new DynamicControl({
      controlType: ControlTypes.SELECT,
      name: 'side',
      label: 'Laterality',
      options: this.laterality_options,
    }),
  ];

  /** MACROSCOPY */
  specimen_type_controls = [
    new DynamicControl({
      name: 'core_needle_biopsy',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'wide_local_excision',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'mastectomy',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'open_biopsy',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'segmental_excision',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'wide_bore_needle_biopsy',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
  ];

  specimen_dimension_controls = [
    new DynamicControl({
      name: 'weight',
      label: 'weight (g)',
      controlType: ControlTypes.NUMBER,
      value: 0,
      required: true,
    }),
    new DynamicControl({
      name: 'length',
      label: 'length (mm)',
      controlType: ControlTypes.NUMBER,
      value: 0,
      required: true,
    }),
    new DynamicControl({
      name: 'width',
      label: 'width (mm)',
      controlType: ControlTypes.NUMBER,
      value: 0,
      required: true,
    }),
    new DynamicControl({
      name: 'height',
      label: 'height (mm)',
      controlType: ControlTypes.NUMBER,
      value: 0,
      required: true,
    }),
  ];

  axillary_procedure_controls = [
    new DynamicControl({
      name: 'no_lymph_node_procedure',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'axillary_node_sample',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'sentinel_node_biopsy',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'axillary_node_clearance',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'intrammary_node',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
  ];

  /** MICROSCOPY */
  in_situ_carcinoma_controls = [
    new DynamicControl({
      name: 'ductal_carcinoma_in_situ',
      label: 'Ductal Carcinoma In-situ size',
      controlType: ControlTypes.NUMBER,
      required: true,
    }),
    new DynamicControl({
      name: 'lobular_carcinoma_in_situ',
      label: 'Lobular Carcinoma In-situ',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'paget_disease',
      label: 'Paget Disease',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'microinvasion',
      label: 'Microinvasion present',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
  ];

  invasive_carcinoma_controls = [
    new DynamicControl({
      name: 'ic_present',
      label: 'Invasive Carcinoma Present',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'invasive_tumor_size',
      label: 'Invasive Tumor Size (mm)',
      controlType: ControlTypes.NUMBER,
    }),
    new DynamicControl({
      name: 'whole_tumor_size',
      label: 'Whole Tumor Size (mm)',
      controlType: ControlTypes.NUMBER,
    }),
    new DynamicControl({
      name: 'ic_type',
      label: 'Invasive Carcinoma Type',
      controlType: ControlTypes.SELECT,
      options: this.invasive_carcinoma_options,
    }),
    new DynamicControl({
      name: 'invasive_grade',
      controlType: ControlTypes.SELECT,
      options: this.invasive_grades_options,
    }),
    new DynamicControl({ name: 'sbr_score', controlType: ControlTypes.NUMBER }),
    new DynamicControl({
      name: 'tumour_extent',
      controlType: ControlTypes.SELECT,
      options: this.tumor_extent_options,
    }),
    new DynamicControl({
      name: 'lympho_vascular_invasion',
      controlType: ControlTypes.SELECT,
      options: this.lympho_options,
    }),
    new DynamicControl({ name: 'site_of_other_nodes' }),
  ];

  axillary_node_controls = [
    new DynamicControl({
      name: 'an_present',
      label: 'Axillary Node Present',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'total_number',
      controlType: ControlTypes.NUMBER,
    }),
    new DynamicControl({
      name: 'number_positive',
      controlType: ControlTypes.NUMBER,
    }),
  ];

  margin_controls = [
    new DynamicControl({ name: 'excision_margins' }),
    new DynamicControl({
      name: 'skin_involvement',
      controlType: ControlTypes.SELECT,
      options: this.skin_involvement_options,
    }),
    new DynamicControl({
      name: 'nipple_involvement',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'skeletal_muscle_involvement',
      controlType: ControlTypes.SELECT,
      options: this.skeletal_options,
    }),
    new DynamicControl({
      name: 'surgical_margins',
      controlType: ControlTypes.SELECT,
      options: this.skin_involvement_options,
    }),
  ];

  surgical_margin_controls = [
    new DynamicControl({
      name: 'superior',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'inferior',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'anterior',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'posterior',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'lateral',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({
      name: 'medial',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
  ];

  pathological_staging_controls = [
    new DynamicControl({
      name: 'not_applicable',
      controlType: ControlTypes.CHECKBOX,
      value: false,
    }),
    new DynamicControl({ name: 'pt', controlType: ControlTypes.NUMBER }),
    new DynamicControl({ name: 'n', controlType: ControlTypes.NUMBER }),
    new DynamicControl({ name: 'm', controlType: ControlTypes.NUMBER }),
  ];

  /** IHC **/
  ihc_controls = [
    new DynamicControl({
      name: 'oestrogen_receptor_status',
      controlType: ControlTypes.SELECT,
      options: this.ihc_options,
    }),
    new DynamicControl({
      name: 'or_quick_allred_score',
      label: 'OR Quick Allred Score',
      controlType: ControlTypes.NUMBER,
    }),
    new DynamicControl({
      name: 'pr',
      label: 'Progesterone Receptor',
      controlType: ControlTypes.SELECT,
      options: this.ihc_options,
    }),
    new DynamicControl({
      name: 'pr_quick_allred_score',
      label: 'PR Quick Allred Score',
      controlType: ControlTypes.NUMBER,
    }),
    new DynamicControl({
      name: 'her2',
      label: 'HER2 NEU',
      controlType: ControlTypes.SELECT,
      options: this.ihc_options,
    }),
  ];

  /** Pathologist report **/
  pathologist_report_controls = [
    new DynamicControl({
      name: 'final_diagnosis',
      required: true,
      controlType: ControlTypes.SELECT,
      options: this.histologic_types,
    }),
    new DynamicControl({
      name: 'comment',
      required: true,
      controlType: ControlTypes.TEXTAREA,
    }),
    new DynamicControl({ name: 'consultant_pathologist', required: true }),
    new DynamicControl({
      name: 'date_of_request',
      controlType: ControlTypes.DATE,
      required: true,
    }),
    new DynamicControl({
      name: 'date_received',
      controlType: ControlTypes.DATE,
      required: true,
    }),
    new DynamicControl({
      name: 'date_reviewed',
      controlType: ControlTypes.DATE,
      required: true,
    }),
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dcs: DynamicFormControlService,

    private ds: ReportsService
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.detailsForm = this.dcs.toFormGroup(this.detail_controls);

    /** MACROSCOPY */
    this.specimen_typeSF = this.dcs.toFormGroup(this.specimen_type_controls);
    this.specimen_dimSF = this.dcs.toFormGroup(
      this.specimen_dimension_controls
    );
    this.axillary_proSF = this.dcs.toFormGroup(
      this.axillary_procedure_controls
    );

    this.macroscopyForm = this.fb.group({
      specimen_type: this.specimen_typeSF,
      specimen_dimensions: this.specimen_dimSF,
      axillary_procedure: this.axillary_proSF,
    });

    /** MICROSCOPY */
    this.in_situSF = this.dcs.toFormGroup(this.in_situ_carcinoma_controls);
    this.invasive_carcinomaSF = this.dcs.toFormGroup(
      this.invasive_carcinoma_controls
    );
    this.axillary_nodeSF = this.dcs.toFormGroup(this.axillary_node_controls);
    this.marginSF = this.dcs.toFormGroup(this.margin_controls);
    this.surgical_marginSF = this.dcs.toFormGroup(
      this.surgical_margin_controls
    );
    this.pathological_stagingSF = this.dcs.toFormGroup(
      this.pathological_staging_controls
    );

    this.microscopyForm = this.fb.group({
      in_situ_carcinoma: this.in_situSF,
      invasive_carcinoma: this.invasive_carcinomaSF,
      axillary_node: this.axillary_nodeSF,
      margin: this.marginSF,
      surgical_margins_actual: this.surgical_marginSF,
      pathological_staging: this.pathological_stagingSF,
    });

    /** IHC */
    this.ihcForm = this.dcs.toFormGroup(this.ihc_controls);

    /** PATHOLOGIST */
    this.pathologistForm = this.dcs.toFormGroup(
      this.pathologist_report_controls
    );
  }

  resetForms(): void {
    this.detailsForm.reset();
    this.macroscopyForm.reset();
    this.microscopyForm.reset();
    this.ihcForm.reset();
    this.pathologistForm.reset();
  }

  get specimenTypesFormArray(): FormArray {
    return this.macroscopyForm.get('specimenTypes') as FormArray;
  }

  nextStep(form?: FormGroup): void {
    this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  saveReport() {
    this.setReportValues();

    const timestamp = new Date().toISOString();

    const data: Report = {
      ...this.report,
      id: this.report?.id ?? uuidV4(),
      initial_details: {
        ...this.report.initial_details,
        reporting_date: this.formatDateToDDMMYYYY(
          this.report.initial_details.reporting_date
        ),
      },
      pathologist_report: {
        ...this.report.pathologist_report,
        date_of_request: this.formatDateToDDMMYYYY(
          this.report.pathologist_report.date_of_request
        ),
        date_received: this.formatDateToDDMMYYYY(
          this.report.pathologist_report.date_received
        ),
        date_reviewed: this.formatDateToDDMMYYYY(
          this.report.pathologist_report.date_reviewed
        ),
      },
      created_at: this.report?.created_at ?? timestamp,
      updated_at: this.report?.updated_at ?? timestamp,
    };
    console.log('Report data to save:', data);
    this.ds.createReport(data).subscribe({
      next: (savedReport) => {
        // console.log('Report saved successfully', savedReport);
        this.snackBar.open('Report saved successfully', 'Close', {
          duration: 5000,
        });
        this.report = new Report(); // Reset the report after saving
        this.resetForms(); // Reinitialize forms to clear input fields
        this.currentStep = 0; // Reset to the first step
      },
      error: (err) => {
        console.error('Error saving report', err);
        this.snackBar.open('Error saving report', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  setReportValues() {
    this.report.initial_details = this.detailsForm.value;
    this.report.macroscopy = this.macroscopyForm.value;
    this.report.microscopy = this.microscopyForm.value;
    this.report.ihc = this.ihcForm.value;
    this.report.pathologist_report = this.pathologistForm.value;
  }

  private formatDateToDDMMYYYY(date?: Date | string | number): string {
    // const options: Intl.DateTimeFormatOptions = {
    //   day: '2-digit',
    //   month: '2-digit',
    //   year: 'numeric',
    // };
  
    // const value = date ?? new Date();
    
    // return new Date(value).toLocaleDateString('en-GB', options);
    const value = date ?? new Date();
    const d = new Date(value);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // private markFormGroupTouched(formGroup: FormGroup): void {
  //   Object.values(formGroup.controls).forEach(control => {
  //     control.markAsTouched();

  //     if (control instanceof FormGroup) {
  //       this.markFormGroupTouched(control);
  //     }
  //   });
  // }
}
