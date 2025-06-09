import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientService } from '../../../core/services/patient.service';
import { MaterialModule } from '../../../shared/material.module';
import { DynamicFormControlComponent } from '../../../shared/components/dynamic-form-control/dynamic-form-control.component';


@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
  imports: [ReactiveFormsModule, MaterialModule, DynamicFormControlComponent]
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isSubmitting = false;
  genders = ['Male', 'Female'];
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  patient_controls = [
    { name: 'hospitalNumber', type: 'text', label: 'Hospital Number', required: true },
    { name: 'firstName', type: 'text', label: 'First Name', required: true },
    { name: 'lastName', type: 'text', label: 'Last Name', required: true },
    { name: 'dateOfBirth', type: 'date', label: 'Date of Birth', required: true },
    { name: 'gender', type: 'text', label: 'Date of Birth', required: true },

    // hospitalNumber: string;
    // firstName: string;
    // lastName: string;
    // dateOfBirth: Date;
    // gender: string;
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
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      email: ['', [Validators.email]],
      address: [''],
      bloodType: [''],
      // allergies: [''],
      medicalHistory: [''],
      // emergencyContactName: ['', [Validators.required]],
      // emergencyContactNumber: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      insuranceProvider: [''],
      insurancePolicyNumber: [''],
      registrationDate: [new Date(), [Validators.required]]
    });
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