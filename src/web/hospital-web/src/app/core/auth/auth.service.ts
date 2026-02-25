import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { LoginRequest } from './models/login-request.model';
import { TokenResponse } from './models/token-response.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:5012/api/v1/auth';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  login(payload: LoginRequest) {
    return this.http.post<TokenResponse>(`${this.api}/login`, payload)
      .pipe(
        tap(res => {
          this.tokenStorage.saveTokens(
            res.accessToken,
            res.refreshToken,
            res.role
          );
        })
      );
  }

  logout() {
    this.tokenStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.tokenStorage.getAccessToken();
    console.log('AuthService - isLoggedIn:', hasToken);
    return hasToken;
  }

  getRole(): string | null {
    const role = this.tokenStorage.getRole();
    console.log('AuthService - getRole:', role);
    return role;
  }

  getUserId(): number | null {
    console.log('=== getUserId() called ===');
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      console.error('getUserId - No token found');
      return null;
    }
    
    console.log('getUserId - Token exists, length:', token.length);
    
    try {
      // JWT format: header.payload.signature
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('getUserId - Full decoded token:', JSON.stringify(decoded, null, 2));
      console.log('getUserId - All claims:', Object.keys(decoded));
      
      // Check for EntityId claim (numeric Patient.Id or Doctor.Id)
      // This is added by the backend for Patient and Doctor roles
      if (decoded.EntityId) {
        const entityId = parseInt(decoded.EntityId, 10);
        console.log('getUserId - Found EntityId:', entityId);
        console.log('getUserId - EntityId type:', typeof decoded.EntityId);
        if (isNaN(entityId)) {
          console.error('getUserId - EntityId is NaN after parsing');
          return null;
        }
        console.log('getUserId - Returning entityId:', entityId);
        return entityId;
      }
      
      console.error('getUserId - No EntityId claim found in token!');
      console.error('getUserId - Available claims:', Object.keys(decoded).join(', '));
      return null;
    } catch (error) {
      console.error('getUserId - Error decoding token:', error);
      return null;
    }
  }
}