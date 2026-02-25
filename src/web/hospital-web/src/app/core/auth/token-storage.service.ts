import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private TOKEN_KEY = 'access_token';
  private REFRESH_KEY = 'refresh_token';
  private ROLE_KEY = 'role';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isLocalStorageAvailable(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  saveTokens(access: string, refresh: string, role: string) {
    console.log('TokenStorage - Saving tokens:', { access: access?.substring(0, 20) + '...', refresh: refresh?.substring(0, 20) + '...', role });
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.TOKEN_KEY, access);
      localStorage.setItem(this.REFRESH_KEY, refresh);
      localStorage.setItem(this.ROLE_KEY, role);
      console.log('TokenStorage - Tokens saved successfully');
    } else {
      console.warn('TokenStorage - localStorage not available!');
    }
  }

  getAccessToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('TokenStorage - Getting access token:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    }
    console.warn('TokenStorage - localStorage not available for getAccessToken!');
    return null;
  }

  getRefreshToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(this.REFRESH_KEY);
    }
    return null;
  }

  getRole(): string | null {
    if (this.isLocalStorageAvailable()) {
      const role = localStorage.getItem(this.ROLE_KEY);
      console.log('TokenStorage - Getting role:', role);
      return role;
    }
    console.warn('TokenStorage - localStorage not available for getRole!');
    return null;
  }

  clear() {
    console.log('TokenStorage - Clearing tokens');
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
  }
}