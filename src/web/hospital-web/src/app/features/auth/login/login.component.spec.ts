import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenResponse } from '../../../core/auth/models/token-response.model';
import { vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      isLoggedIn: vi.fn().mockReturnValue(false),
      getRole: vi.fn().mockReturnValue(null)
    };
    routerMock = { navigate: vi.fn() };
    activatedRouteMock = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize login form with email and password controls', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')).toBeDefined();
      expect(component.loginForm.get('password')).toBeDefined();
    });

    it('should have required validators on email and password', () => {
      const email = component.loginForm.get('email');
      const password = component.loginForm.get('password');

      email?.setValue('');
      password?.setValue('');

      expect(email?.hasError('required')).toBe(true);
      expect(password?.hasError('required')).toBe(true);
    });

    it('should have email validator on email field', () => {
      const email = component.loginForm.get('email');
      
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);

      email?.setValue('valid@email.com');
      expect(email?.hasError('email')).toBe(false);
    });

    it('should get returnUrl from query params', () => {
      activatedRouteMock.snapshot.queryParams = { returnUrl: '/patients' };
      component.ngOnInit();
      
      expect(component.returnUrl).toBe('/patients');
    });

    it('should default returnUrl to empty string when not provided', () => {
      expect(component.returnUrl).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: ''
      });

      component.onSubmit();

      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should mark fields as touched when submitting invalid form', () => {
      component.loginForm.patchValue({
        email: '',
        password: ''
      });

      component.onSubmit();

      expect(component.email?.touched).toBe(true);
      expect(component.password?.touched).toBe(true);
    });

    it('should be valid when email and password are provided', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('Login Success', () => {
    it('should call authService.login with form values', () => {
      // Arrange
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Admin'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password'
      });
    });

    it('should navigate to /doctors for Admin role', () => {
      // Arrange
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Admin'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/doctors']);
    });

    it('should navigate to /patients for Doctor role', () => {
      // Arrange
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Doctor'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      
      component.loginForm.patchValue({
        email: 'doctor@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/patients']);
    });

    it('should navigate to /appointments for Patient role', () => {
      // Arrange
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Patient'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      
      component.loginForm.patchValue({
        email: 'patient@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/appointments']);
    });

    it('should navigate to returnUrl when provided', () => {
      // Arrange
      component.returnUrl = '/records';
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Admin'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/records']);
    });

    it('should clear error message on successful login', () => {
      // Arrange
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Admin'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      component.errorMessage.set('Previous error');
      component.showError.set(true);
      
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage()).toBe('');
      expect(component.showError()).toBe(false);
    });

    it('should set isLoading to false after successful login', () => {
      // Arrange
      const mockResponse: TokenResponse = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: '2026-12-31T23:59:59Z',
        role: 'Admin'
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));
      
      component.loginForm.patchValue({
        email: 'admin@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Login Errors', () => {
    it('should display error message for 401 Unauthorized', () => {
      // Arrange
      const error = {
        status: 401,
        error: { detail: 'Invalid credentials' }
      };
      authServiceMock.login.mockReturnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        email: 'wrong@test.com',
        password: 'wrongpassword'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage()).toBe('Invalid credentials');
      expect(component.showError()).toBe(true);
      expect(component.isLoading).toBe(false);
    });

    it('should display connection error for status 0', () => {
      // Arrange
      const error = { status: 0 };
      authServiceMock.login.mockReturnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage()).toContain('Cannot connect to server');
      expect(component.showError()).toBe(true);
    });

    it('should display 404 error message', () => {
      // Arrange
      const error = { status: 404 };
      authServiceMock.login.mockReturnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage()).toContain('Login endpoint not found');
    });

    it('should display 400 Bad Request error', () => {
      // Arrange
      const error = {
        status: 400,
        error: { detail: 'Invalid request' }
      };
      authServiceMock.login.mockReturnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage()).toBe('Invalid request');
    });

    it('should display generic error message for unknown errors', () => {
      // Arrange
      const error = { status: 500, error: {} };
      authServiceMock.login.mockReturnValue(throwError(() => error));
      
      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'password'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage()).toContain('Login failed');
    });
  });

  describe('Form Getters', () => {
    it('should return email control', () => {
      const emailControl = component.email;
      expect(emailControl).toBe(component.loginForm.get('email'));
    });

    it('should return password control', () => {
      const passwordControl = component.password;
      expect(passwordControl).toBe(component.loginForm.get('password'));
    });
  });
});


