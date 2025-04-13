import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-form-control',
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './dynamic-form-control.component.html',
  styleUrl: './dynamic-form-control.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DynamicFormControlComponent {
  @Input() control: any;
  formControl = new FormControl();
  @Input() form!: FormGroup;

  ngOnInit(): void {
    if (this.control?.value !== undefined) {
      this.formControl.setValue(this.control.value);
    }    
  }

  getformControl() {
    return this.form.get(this.control.name);
  }

  get showError() {
    const control = this.formControl;
    return control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage() {
    const control = this.formControl;
    if (!control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['requiredTrue']) return 'You must accept the terms';

    return 'Invalid value';
  }
}
