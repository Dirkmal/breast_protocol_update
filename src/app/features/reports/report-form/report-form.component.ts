import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { AxillaryProcedures, IHC, InSituCarcinoma, InvasiveCarcinomaTypes, InvasiveGrades, Laterality, Lympho, SkeletalMuscle, SkinInvolvement, SpecimenTypes, SurgicalMargins, TumourExtent } from '../../../core/models/report.model';
import { ControlTypes, DynamicControl, InputTypes } from '../../../models/dynamic-control';
import { DynamicFormControlComponent } from '../../../shared/dynamic-form-control/dynamic-form-control.component';
import { DynamicFormControlService } from '../../../core/services/dynamic-form-control.service';

interface Patient {
  id: string;
  name: string;
}

interface Clinician {
  id: string;
  name: string;
}

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
  currentStep = 0;

  // sub-forms for macroscopy
  specimen_typeSF!: FormGroup;
  specimen_dimSF!: FormGroup;
  axillary_proSF!: FormGroup;

  // sub-forms for microscopy


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

  in_situ_carcinoma_controls = [
    new DynamicControl({ name: 'dcis', label: 'Dual Carcinoma In-situ (DCIS) size', type: InputTypes.NUMBER }),
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
    
    this.specimen_typeSF = this.dcs.toFormGroup(this.specimen_type_controls);
    this.specimen_dimSF = this.dcs.toFormGroup(this.specimen_dimension_controls);
    this.axillary_proSF = this.dcs.toFormGroup(this.axillary_procedure_controls);

    this.macroscopyForm = new FormGroup({'specimen_type': this.specimen_typeSF});
		this.macroscopyForm.addControl('specimen_dimensions', this.specimen_dimSF);
		this.macroscopyForm.addControl('axillary_procedure', this.axillary_proSF) ;



    this.microscopyForm = this.fb.group({
      dcis: ['', [Validators.required, Validators.min(0)]],
      in_situ_carcinoma: this.fb.array(
        this.in_situ_carcinoma_options.map(() => this.fb.control(false))
      ),
      microinvasion: [''],
      ic_present: [''],
      invasive_tumor_size: ['', [Validators.min(0)]],
      whole_tumor_size: ['', [Validators.min(0)]],
      invasive_carcinoma_type: this.fb.array(
        this.invasive_carcinoma_options.map(() => this.fb.control(false))
      ),
      invasive_grade: this.fb.array(
        this.invasive_grades_options.map(() => this.fb.control(false))
      ),
      sbr_score: ['', [Validators.min(0)]],
      tumour_extent: this.fb.array(
        this.tumor_extent_options.map(() => this.fb.control(false))
      ),
      lympho_vascular_invasion: this.fb.array(
        this.lympho_options.map(() => this.fb.control(false))
      ),
      site_of_other_nodes: ['']
    });
  }

  get specimenTypesFormArray(): FormArray {
    return this.macroscopyForm.get('specimenTypes') as FormArray;
  }

  nextStep(form?: FormGroup): void {
    // if (this.currentStep === 0 && this.detailsForm.valid) {
    //   this.currentStep = 1;
    // } else if (this.currentStep === 1 && this.macroscopyForm.valid) {
    //   this.submitReport();
    // } else {
    //   this.markFormGroupTouched(this.currentStep === 0 ? this.detailsForm : this.macroscopyForm);
    //   this.snackBar.open('Please fix the errors before proceeding.', 'Close', {
    //     duration: 3000
    //   });
    // }
    this.currentStep++;
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitReport(): void {
    // if (this.detailsForm.valid && this.macroscopyForm.valid) {
    //   const formData = {
    //     details: this.detailsForm.value,
    //     macroscopy: {
    //       ...this.macroscopyForm.value,
    //       selectedSpecimenTypes: this.specimenTypes.filter((_, i) => 
    //         this.specimenTypesFormArray.value[i]
    //       )
    //     }
    //   };
      
      // console.log('Report data:', formData);
      this.snackBar.open('Patient report submitted successfully!', 'Close', {
        duration: 3000
      });
      
      // Reset forms and return to first step
      this.initForms();
      this.currentStep = 0;
    // }
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