import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { LoginRequest } from './models/login-request.model';
import { TokenResponse } from './models/token-response.model';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorageMock: any;
  let routerMock: any;

  beforeEach(() => {
    tokenStorageMock = {
      saveTokens: vi.fn(),
      getAccessToken: vi.fn(),
      getRole: vi.fn(),
      clear: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenStorageService, useValue: tokenStorageMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login', () => {
    it('should send login request and save tokens on success', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse: TokenResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        role: 'Admin',
        expiresAt: '2026-03-01T00:00:00'
      };

      // Act
      const promise = service.login(loginRequest).toPromise();
      
      const req = httpMock.expectOne('http://localhost:5012/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);

      const response = await promise;
      
      // Assert
      expect(response).toEqual(mockResponse);
      expect(tokenStorageMock.saveTokens).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token',
        'Admin'
      );
    });

    it('should handle login error', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };
      const errorResponse = { message: 'Invalid credentials' };

      // Act
      const promise = service.login(loginRequest).toPromise();
      
      const req = httpMock.expectOne('http://localhost:5012/api/v1/auth/login');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });

      // Assert
      try {
        await promise;
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.status).toBe(401);
        expect(error.error).toEqual(errorResponse);
        expect(tokenStorageMock.saveTokens).not.toHaveBeenCalled();
      }
    });
  });

  describe('logout', () => {
    it('should clear tokens and navigate to login page', () => {
      // Act
      service.logout();

      // Assert
      expect(tokenStorageMock.clear).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when access token exists', () => {
      // Arrange
      tokenStorageMock.getAccessToken.mockReturnValue('mock-token');

      // Act
      const result = service.isLoggedIn();

      // Assert
      expect(result).toBe(true);
      expect(tokenStorageMock.getAccessToken).toHaveBeenCalled();
    });

    it('should return false when access token does not exist', () => {
      // Arrange
      tokenStorageMock.getAccessToken.mockReturnValue(null);

      // Act
      const result = service.isLoggedIn();

      // Assert
      expect(result).toBe(false);
      expect(tokenStorageMock.getAccessToken).toHaveBeenCalled();
    });
  });

  describe('getRole', () => {
    it('should return role from token storage', () => {
      // Arrange
      tokenStorageMock.getRole.mockReturnValue('Doctor');

      // Act
      const result = service.getRole();

      // Assert
      expect(result).toBe('Doctor');
      expect(tokenStorageMock.getRole).toHaveBeenCalled();
    });

    it('should return null when no role exists', () => {
      // Arrange
      tokenStorageMock.getRole.mockReturnValue(null);

      // Act
      const result = service.getRole();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return null when no token exists', () => {
      // Arrange
      tokenStorageMock.getAccessToken.mockReturnValue(null);

      // Act
      const result = service.getUserId();

      // Assert
      expect(result).toBeNull();
    });

    it('should decode and return EntityId from valid token', () => {
      // Arrange
      const payload = { EntityId: '123', role: 'Doctor' };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      tokenStorageMock.getAccessToken.mockReturnValue(token);

      // Act
      const result = service.getUserId();

      // Assert
      expect(result).toBe(123);
    });

    it('should return null when token has no EntityId claim', () => {
      // Arrange
      const payload = { role: 'Admin' };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      tokenStorageMock.getAccessToken.mockReturnValue(token);

      // Act
      const result = service.getUserId();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when EntityId is not a valid number', () => {
      // Arrange
      const payload = { EntityId: 'invalid' };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      tokenStorageMock.getAccessToken.mockReturnValue(token);

      // Act
      const result = service.getUserId();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle token decode errors gracefully', () => {
      // Arrange
      tokenStorageMock.getAccessToken.mockReturnValue('invalid-token');

      // Act
      const result = service.getUserId();

      // Assert
      expect(result).toBeNull();
    });
  });
});
