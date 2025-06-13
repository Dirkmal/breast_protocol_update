import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientService } from '../../../core/services/patient.service';
import { MaterialModule } from '../../../shared/material.module';
import { DynamicFormControlComponent } from '../../../shared/components/dynamic-form-control/dynamic-form-control.component';
import { ControlTypes, DynamicControl } from '../../../models/dynamic-control';
import { DynamicFormControlService } from '../../../core/services/dynamic-form-control.service';


@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
  imports: [ReactiveFormsModule, MaterialModule, DynamicFormControlComponent, ReactiveFormsModule]
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isSubmitting = false;
  genders = ['Male', 'Female'];
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  patient_controls = [
    new DynamicControl({ name: 'hospital_number', required: true }),
    new DynamicControl({ name: 'first_name', required: true }),
    new DynamicControl({ name: 'last_name', required: true }),
    new DynamicControl({ name: 'date_of_birth', required: true }),
    new DynamicControl({ name: 'gender', controlType: ControlTypes.SELECT, required: true }),

    
    // contactNumber: string;
    // insurance_provider?: string;
    // insurance_number?: string;
    // email?: string;
    // address?: string;
    // bloodGroup?: string;
    // medicalHistory?: string;
    // createdBy?: string;
    // createdAt?: Date;
    // updatedAt?: Date;
  ]

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private dcs: DynamicFormControlService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.patientForm = this.dcs.toFormGroup(this.patient_controls);
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isSubmitting = true;
      const patientData = this.patientForm.value;
      
      // this.patientService.createPatient(patientData)
      //   .subscribe({
      //     next: (response) => {
      //       this.snackBar.open('Patient registered successfully!', 'Close', {
      //         duration: 3000,
      //         horizontalPosition: 'end',
      //         verticalPosition: 'top'
      //       });
      //       this.router.navigate(['/patients']);
      //     },
      //     error: (error) => {
      //       this.isSubmitting = false;
      //       this.snackBar.open('Failed to register patient. Please try again.', 'Close', {
      //         duration: 5000,
      //         horizontalPosition: 'end',
      //         verticalPosition: 'top'
      //       });
      //       console.error('Error registering patient:', error);
      //     },
      //     complete: () => {
      //       this.isSubmitting = false;
      //     }
      //   });
    } else {
      this.markFormGroupTouched(this.patientForm);
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}