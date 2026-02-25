import { Component, OnInit, ChangeDetectorRef, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = signal('');
  showError = signal(false);
  isLoading: boolean = false;
  returnUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get the return URL from route parameters or default to role-based dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.errorMessage.set('');
        this.showError.set(false);
        console.log('Login - Tokens should now be saved in localStorage');
        
        // Verify tokens were saved
        setTimeout(() => {
          console.log('Login - Verifying auth state after save:');
          console.log('  - isLoggedIn:', this.authService.isLoggedIn());
          console.log('  - role:', this.authService.getRole());
        }, 100);
        
        this.isLoading = false;
        const role = response.role.toLowerCase();
        
        // If there's a return URL (user was trying to access a protected page), go there
        if (this.returnUrl) {
          console.log('Navigating to return URL:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        } else {
          // Otherwise, navigate based on role
          console.log('Navigating based on role:', role);
          switch (role) {
            case 'admin':
              this.router.navigate(['/doctors']); // Admin can manage doctors
              break;
            case 'doctor':
              this.router.navigate(['/patients']); // Doctors can view their patients
              break;
            case 'patient':
              this.router.navigate(['/appointments']); // Patients can view/book appointments
              break;
            case 'receptionist':
            case 'nurse':
              this.router.navigate(['/appointments']); // Reception/Nurse manage appointments
              break;
            default:
              this.router.navigate(['/appointments']);
          }
        }
      },
      error: (error) => {
        // Run error handling inside Angular zone
        this.ngZone.run(() => {
          this.isLoading = false;
          
          let message = '';
          
          // Backend returns ProblemDetails format with 'detail' property
          if (error.status === 0) {
            message = 'Cannot connect to server. Please check if the backend API is running on http://localhost:5012';
          } else if (error.status === 401) {
            message = error.error?.detail || 'Invalid email or password. Please try again.';
          } else if (error.status === 404) {
            message = 'Login endpoint not found. Please check API configuration.';
          } else if (error.status === 400) {
            message = error.error?.detail || error.error?.title || 'Invalid credentials. Please check your email and password.';
          } else {
            message = error.error?.detail || error.error?.title || 'Login failed. Please try again.';
          }
          
          this.errorMessage.set(message);
          this.showError.set(true);
        });
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
