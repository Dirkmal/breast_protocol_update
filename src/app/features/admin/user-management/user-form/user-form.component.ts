
  import { Component, Inject, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
  import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { User } from '../../../../core/models/user.model';
  import { UserService } from '../../../../core/services/user.service';
import { MaterialModule } from '../../../../shared/material.module';
  
  @Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss'],
    imports: [MaterialModule, ReactiveFormsModule]
  })
  export class UserFormComponent implements OnInit {
    userForm!: FormGroup;
    isEdit = false;
    loading = false;
    hidePassword = true;
    roles = [
      { value: 'admin', label: 'Administrator' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'staff', label: 'Staff' }
    ];
  
    departments = [
      'Cardiology',
      'Neurology',
      'Pediatrics',
      'Oncology',
      'Orthopedics',
      'Emergency',
      'Radiology',
      'Internal Medicine',
      'Surgery',
      'Administration'
    ];
  
    constructor(
      private fb: FormBuilder,
      private userService: UserService,
      private snackBar: MatSnackBar,
      public dialogRef: MatDialogRef<UserFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { user?: User }
    ) {
      this.isEdit = !!data.user;
    }
  
    ngOnInit(): void {
      this.initForm();
      
      if (this.isEdit && this.data.user) {
        this.populateForm(this.data.user);
      }
    }
  
    initForm(): void {
      this.userForm = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
        role: ['', [Validators.required]],
        department: [''],
        active: [true]
      });
      
      // Make department required if role is doctor or nurse
      this.userForm.get('role')?.valueChanges.subscribe(role => {
        const departmentControl = this.userForm.get('department');
        if (role === 'doctor' || role === 'nurse') {
          departmentControl?.setValidators([Validators.required]);
        } else {
          departmentControl?.clearValidators();
        }
        departmentControl?.updateValueAndValidity();
      });
    }
  
    populateForm(user: User): void {
      // Remove password field from form for edit mode
      this.userForm.removeControl('password');
      
      this.userForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department || '',
        active: user.active
      });
    }
  
    onSubmit(): void {
      if (this.userForm.invalid) {
        return;
      }
  
      this.loading = true;
      const userData: User = this.userForm.value;
  
      if (this.isEdit && this.data.user?.id) {
        this.userService.updateUser(this.data.user.id, userData).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Failed to update user', 'Close', { duration: 5000 });
            this.loading = false;
          }
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Failed to create user', 'Close', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    }
  }
