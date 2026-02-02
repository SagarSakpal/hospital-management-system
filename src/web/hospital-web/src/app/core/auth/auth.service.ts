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
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  getRole(): string | null {
    return this.tokenStorage.getRole();
  }
}