import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { AxillaryProcedures, IHC, InSituCarcinoma, InvasiveCarcinomaTypes, InvasiveGrades, Laterality, Lympho, SkeletalMuscle, SkinInvolvement, SpecimenTypes, SurgicalMargins, TumourExtent } from '../../../core/models/report.model';
import { ControlTypes, DynamicControl, InputTypes } from '../../../models/dynamic-control';
import { DynamicFormControlComponent } from '../../../shared/dynamic-form-control/dynamic-form-control.component';
import { DynamicFormControlService } from '../../../core/services/dynamic-form-control.service';

@Component({
  selector: 'app-report-form',
  imports: [MaterialModule, ReactiveFormsModule, CommonModule, DynamicFormControlComponent],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.scss'
})

export class ReportFormComponent implements OnInit {
  

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
	ihc_options: string[] = Object.values(IHC);	
  
  detail_controls = [
    new DynamicControl({ name: 'hospital_Number', required: true }),
    new DynamicControl({ name: 'histology_Number', required: true }),
    new DynamicControl({ name: 'referring_Clinician', required: true }),
    new DynamicControl({ controlType: ControlTypes.DATE, name: 'reporting_Date', required: true}),
    new DynamicControl({ controlType: ControlTypes.SELECT, name: 'side', label: 'Laterality', options: this.laterality_options}),      
  ];
  
  /** MACROSCOPY */
  specimen_type_controls = [
    new DynamicControl({ name: 'core_needle_biopsy', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'wide_local_excision', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'mastectomy', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'open_biopsy', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'segmental_excision', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'wide_bore_needle_biopsy', controlType: ControlTypes.CHECKBOX }),
  ];

  specimen_dimension_controls = [
    new DynamicControl({ name: 'weight', label: 'weight (g)', type: InputTypes.NUMBER, value: 0, required: true }),
		new DynamicControl({ name: 'length', label: 'length (mm)', type: InputTypes.NUMBER, value: 0, required: true }),
		new DynamicControl({ name: 'width', label: 'width (mm)', type: InputTypes.NUMBER, value: 0, required: true }),
		new DynamicControl({ name: 'height', label: 'height (mm)', type: InputTypes.NUMBER, value: 0, required: true }),
  ];

  axillary_procedure_controls = [
    new DynamicControl({ name: 'no_lymph_node_procedure', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'axillary_node_sample', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'sentinel_node_biopsy', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'axillary_node_clearance', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'intrammary_node', controlType: ControlTypes.CHECKBOX }),
  ];

  /** MICROSCOPY */
  in_situ_carcinoma_controls = [
    new DynamicControl({ name: 'dcis', label: 'Dual Carcinoma In-situ (DCIS) size', type: InputTypes.NUMBER, required: true }),
    new DynamicControl({ name: 'lobular', label: 'Lobular Carcinoma In-situ', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'paget', label: 'Paget Disease', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'microinvasion', label: 'Microinvasion present', controlType: ControlTypes.CHECKBOX }),
  ];

  invasive_carcinoma_controls = [
    new DynamicControl({ name: 'invasive_present', label: 'Invasive Carcinoma Present', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'invasive_tumor_size', label: 'Invasive Tumor Size (mm)', type: InputTypes.NUMBER }),
    new DynamicControl({ name: 'whole_tumor_size', label: 'Whole Tumor Size (mm)', type: InputTypes.NUMBER }),
    new DynamicControl({ name: 'invasive_carcinoma_type', controlType: ControlTypes.SELECT, options: this.invasive_carcinoma_options }),
    new DynamicControl({ name: 'invasive_grade', controlType: ControlTypes.SELECT, options: this.invasive_grades_options }),
    new DynamicControl({ name: 'sbr_score', type: InputTypes.NUMBER }),
    new DynamicControl({ name: 'tumor_extent', controlType: ControlTypes.SELECT, options: this.tumor_extent_options }),
    new DynamicControl({ name: 'lympho_vascular_invasion', controlType: ControlTypes.SELECT, options: this.lympho_options }),
    new DynamicControl({ name: 'site_of_other_nodes' })
  ];

  axillary_node_controls = [
    new DynamicControl({ name: 'axillary_node_present', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'total_number', type: InputTypes.NUMBER }),
    new DynamicControl({ name: 'number_positive', type: InputTypes.NUMBER })
  ];

  margin_controls = [
    new DynamicControl({ name: 'excision_margins' }),
    new DynamicControl({ name: 'skin_involvement', controlType: ControlTypes.SELECT, options: this.skin_involvement_options }),
    new DynamicControl({ name: 'nipple_involvement', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'skeletal_muscle_involvement', controlType: ControlTypes.SELECT, options: this.skeletal_options }),
    new DynamicControl({ name: 'surgical_margins', controlType: ControlTypes.SELECT, options: this.skin_involvement_options }),
  ];

  surgical_margin_controls = [
    new DynamicControl({ name: 'superior', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'inferior', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'anterior', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'posterior', controlType: ControlTypes.CHECKBOX }),
		new DynamicControl({ name: 'lateral', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'medial', controlType: ControlTypes.CHECKBOX })
  ]

  pathological_staging_controls = [
    new DynamicControl({ name: 'pt_not_applicable', label: 'not applicable', controlType: ControlTypes.CHECKBOX }),
    new DynamicControl({ name: 'pt', type: InputTypes.NUMBER }),
    new DynamicControl({ name: 'n', type: InputTypes.NUMBER }),
    new DynamicControl({ name: 'm', type: InputTypes.NUMBER }),
  ]

  /** IHC **/
	ihc_controls = [
		new DynamicControl({ name: 'oestrogen_receptor_status', controlType: ControlTypes.SELECT, options: this.ihc_options }),
		new DynamicControl({ name: 'pr', controlType: ControlTypes.SELECT, options: this.ihc_options }),
		new DynamicControl({ name: 'her2', controlType: ControlTypes.SELECT, options: this.ihc_options }),
		new DynamicControl({ name: 'quick_allred_score', type: InputTypes.NUMBER })
	];

	/** Pathologist report **/
	pathologist_report_controls = [
		new DynamicControl({ name: 'final_diagnosis', required: true, controlType: ControlTypes.TEXTAREA}),
		new DynamicControl({ name: 'comment', required: true, controlType: ControlTypes.TEXTAREA}),
		new DynamicControl({ name: 'consultant_pathologist', required: true}),
		new DynamicControl({ name: 'date_of_request', controlType: ControlTypes.DATE, required: true}),
		new DynamicControl({ name: 'date_received', controlType: ControlTypes.DATE, required: true}),
		new DynamicControl({ name: 'date_reviewed', controlType: ControlTypes.DATE, required: true}),	
	];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dcs: DynamicFormControlService
  ) { }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.detailsForm = this.dcs.toFormGroup(this.detail_controls);
    
    /** MACROSCOPY */
    this.specimen_typeSF = this.dcs.toFormGroup(this.specimen_type_controls);
    this.specimen_dimSF = this.dcs.toFormGroup(this.specimen_dimension_controls);
    this.axillary_proSF = this.dcs.toFormGroup(this.axillary_procedure_controls);

    this.macroscopyForm =this.fb.group({
      specimen_type: this.specimen_typeSF,
		  specimen_dimensions: this.specimen_dimSF,
		  axillary_procedure: this.axillary_proSF
    }) ;

    /** MICROSCOPY */
    this.in_situSF = this.dcs.toFormGroup(this.in_situ_carcinoma_controls);
    this.invasive_carcinomaSF = this.dcs.toFormGroup(this.invasive_carcinoma_controls);
    this.axillary_nodeSF = this.dcs.toFormGroup(this.axillary_node_controls);
    this.marginSF = this.dcs.toFormGroup(this.margin_controls);
    this.surgical_marginSF = this.dcs.toFormGroup(this.surgical_margin_controls);
    this.pathological_stagingSF = this.dcs.toFormGroup(this.pathological_staging_controls);

    this.microscopyForm = this.fb.group({
      in_situ: this.in_situSF,
      invasive_carcinoma: this.invasive_carcinomaSF,
      axillary_node: this.axillary_nodeSF,
      margin: this.marginSF,
      surgical_margin: this.surgical_marginSF,
      pathological_staging: this.pathological_stagingSF
    });

    /** IHC */
    this.ihcForm = this.dcs.toFormGroup(this.ihc_controls);

    /** PATHOLOGIST */
    this.pathologistForm = this.dcs.toFormGroup(this.pathologist_report_controls);
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

  submitReport(): void {
      console.log(this.detailsForm.value)
      this.snackBar.open('Patient report submitted successfully!', 'Close', {
        duration: 3000
      });
      
      // Reset forms and return to first step
      this.initForms();
      this.currentStep = 0;
    // }
  }

  setReportValues() {		
		// this.report.initial_details = this.detailsForm.value;
		// this.report.macroscopy = this.macroscopyForm.value;
		// this.report.microscopy = this.microscopyForm.value;
		// this.report.ihc = this.ihcForm.value;
		// this.report.pathologist_report = this.pathologistForm.value;
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