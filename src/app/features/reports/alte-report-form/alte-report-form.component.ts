import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { DynamicFormControlComponent } from '../../../shared/dynamic-form-control/dynamic-form-control.component';

@Component({
  selector: 'app-alte-report-form',
  imports: [ReactiveFormsModule, MaterialModule, CommonModule, DynamicFormControlComponent],
  templateUrl: './alte-report-form.component.html',
  styleUrl: './alte-report-form.component.scss'
})
export class AlteReportFormComponent {
  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    acceptTerms: new FormControl(false, [Validators.requiredTrue]),
    bio: new FormControl(''),
    country: new FormControl('', [Validators.required])
  });
  
  controls = [
    { controlType: 'input', name: 'username', label: 'Username', placeholder: 'Enter username' },
    { controlType: 'textarea', name: 'bio', label: 'Bio', placeholder: 'Short bio' },
    { controlType: 'select', name: 'country', label: 'Country', options: [
      { label: 'Nigeria', value: 'ng' },
      { label: 'Kenya', value: 'ke' }
    ]},
    { controlType: 'checkbox', name: 'acceptTerms', label: 'Accept Terms' }
  ];

  submit() {
    console.log(this.form.value)
  }
  
}
