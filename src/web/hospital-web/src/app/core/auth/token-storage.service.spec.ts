import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { vi } from 'vitest';

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return localStorageMock[key] || null;
    });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete localStorageMock[key];
    });

    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      localStorageMock = {};
    });

    TestBed.configureTestingModule({
      providers: [
        TokenStorageService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(TokenStorageService);
  });

  describe('saveTokens', () => {
    it('should save access token, refresh token, and role to localStorage', () => {
      // Arrange
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const role = 'Admin';

      // Act
      service.saveTokens(accessToken, refreshToken, role);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', accessToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', refreshToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('role', role);
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from localStorage', () => {
      // Arrange
      localStorageMock['access_token'] = 'stored-access-token';

      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBe('stored-access-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
    });

    it('should return null when no access token exists', () => {
      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from localStorage', () => {
      // Arrange
      localStorageMock['refresh_token'] = 'stored-refresh-token';

      // Act
      const token = service.getRefreshToken();

      // Assert
      expect(token).toBe('stored-refresh-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should return null when no refresh token exists', () => {
      // Act
      const token = service.getRefreshToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('getRole', () => {
    it('should retrieve role from localStorage', () => {
      // Arrange
      localStorageMock['role'] = 'Doctor';

      // Act
      const role = service.getRole();

      // Assert
      expect(role).toBe('Doctor');
      expect(localStorage.getItem).toHaveBeenCalledWith('role');
    });

    it('should return null when no role exists', () => {
      // Act
      const role = service.getRole();

      // Assert
      expect(role).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all tokens and role from localStorage', () => {
      // Arrange
      localStorageMock['access_token'] = 'token1';
      localStorageMock['refresh_token'] = 'token2';
      localStorageMock['role'] = 'Admin';

      // Act
      service.clear();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('role');
    });
  });

  describe('Platform detection', () => {
    it('should handle non-browser platform gracefully', () => {
      // Arrange - Create service with server platform
      const serverService = new TokenStorageService('server');

      // Act
      serverService.saveTokens('token', 'refresh', 'Admin');
      const token = serverService.getAccessToken();

      // Assert - Should not throw errors, but won't save anything
      expect(token).toBeNull();
    });
  });
});
