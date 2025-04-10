import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MaterialModule } from '../../../shared/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [MaterialModule, RouterModule, ReactiveFormsModule, NgIf]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '/';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: err => {
        this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }
}