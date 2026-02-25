import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';

let hasRetriedOnce = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getAccessToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq).pipe(
      tap(() => {
        // Reset retry flag on successful request
        hasRetriedOnce = false;
      })
    );
  }

  // If no token and haven't retried yet, wait briefly and retry once
  // This handles hydration timing issues
  if (!hasRetriedOnce) {
    console.log('JWT Interceptor - No token, will retry after delay');
    
    return next(req).pipe(
      catchError(err => {
        if (err.status === 401 && !hasRetriedOnce) {
          hasRetriedOnce = true;
          console.log('JWT Interceptor - 401, retrying with token after delay');
          // Wait 100ms for localStorage to be ready, then retry
          return timer(100).pipe(
            switchMap(() => {
              const retryToken = tokenStorage.getAccessToken();
              if (retryToken) {
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${retryToken}`
                  }
                });
                return next(retryReq).pipe(
                  tap(() => {
                    // Reset flag after successful retry
                    setTimeout(() => hasRetriedOnce = false, 1000);
                  })
                );
              }
              return throwError(() => err);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  return next(req);
};
