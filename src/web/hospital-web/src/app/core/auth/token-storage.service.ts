import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private TOKEN_KEY = 'access_token';
  private REFRESH_KEY = 'refresh_token';
  private ROLE_KEY = 'role';

  saveTokens(access: string, refresh: string, role: string) {
    localStorage.setItem(this.TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_KEY, refresh);
    localStorage.setItem(this.ROLE_KEY, role);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }
}