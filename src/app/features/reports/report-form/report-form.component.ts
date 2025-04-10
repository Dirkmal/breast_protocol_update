import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material.module';

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
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.scss'
})

export class ReportFormComponent implements OnInit {
  detailsForm!: FormGroup;
  macroscopyForm!: FormGroup;
  currentStep = 0;
  
  patients: Patient[] = [
    { id: 'P001', name: 'John Doe' },
    { id: 'P002', name: 'Jane Smith' },
    { id: 'P003', name: 'Michael Johnson' },
    { id: 'P004', name: 'Emily Williams' },
  ];

  clinicians: Clinician[] = [
    { id: 'C001', name: 'Dr. Robert Chen' },
    { id: 'C002', name: 'Dr. Sarah Miller' },
    { id: 'C003', name: 'Dr. David Wilson' },
    { id: 'C004', name: 'Dr. Lisa Brown' },
  ];

  sides = ['Left', 'Right', 'Both'];

  specimenTypes = [
    'Open biopsy',
    'Wide Bore Needle Biopsy',
    'Wide Local Excision',
    'Mastectomy',
    'Segmental Excision',
    'Core Needle Biopsy'
  ];

  filteredPatients: Patient[] = [];
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.filteredPatients = [...this.patients];
  }

  initForms(): void {
    this.detailsForm = this.fb.group({
      hospitalNumber: ['', Validators.required],
      referringClinician: ['', Validators.required],
      reportingDate: [new Date(), Validators.required],
      side: ['', Validators.required]
    });

    this.macroscopyForm = this.fb.group({
      specimenTypes: this.fb.array(
        this.specimenTypes.map(() => this.fb.control(false))
      ),
      dimensions: this.fb.group({
        x: ['', [Validators.required, Validators.min(0)]],
        y: ['', [Validators.required, Validators.min(0)]],
        z: ['', [Validators.required, Validators.min(0)]]
      }),
      weight: ['', [Validators.required, Validators.min(0)]]
    });
  }

  filterPatients(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(patient => 
      patient.id.toLowerCase().includes(filterValue) || 
      patient.name.toLowerCase().includes(filterValue)
    );
  }

  get specimenTypesFormArray(): FormArray {
    return this.macroscopyForm.get('specimenTypes') as FormArray;
  }

  nextStep(): void {
    if (this.currentStep === 0 && this.detailsForm.valid) {
      this.currentStep = 1;
    } else if (this.currentStep === 1 && this.macroscopyForm.valid) {
      this.submitReport();
    } else {
      this.markFormGroupTouched(this.currentStep === 0 ? this.detailsForm : this.macroscopyForm);
      this.snackBar.open('Please fix the errors before proceeding.', 'Close', {
        duration: 3000
      });
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitReport(): void {
    if (this.detailsForm.valid && this.macroscopyForm.valid) {
      const formData = {
        details: this.detailsForm.value,
        macroscopy: {
          ...this.macroscopyForm.value,
          selectedSpecimenTypes: this.specimenTypes.filter((_, i) => 
            this.specimenTypesFormArray.value[i]
          )
        }
      };
      
      console.log('Report data:', formData);
      this.snackBar.open('Patient report submitted successfully!', 'Close', {
        duration: 3000
      });
      
      // Reset forms and return to first step
      this.initForms();
      this.currentStep = 0;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}