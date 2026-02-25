import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Only logout on 401 if we're not on login page already
      // and if the user has no token at all
      if (error.status === 401) {
        console.warn('401 Unauthorized detected');
        const currentUrl = router.url;
        
        // Don't logout if already on login page or if this is during page load
        if (!currentUrl.includes('/login') && !authService.isLoggedIn()) {
          console.warn('No valid token found, redirecting to login');
          authService.logout();
        } else {
          console.log('401 error but user has token or already on login, ignoring');
        }
      }
      return throwError(() => error);
    })
  );
};
