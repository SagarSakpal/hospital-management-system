import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// Track if this is the first navigation after page load
let isFirstNavigation = true;

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Skip auth check during SSR
  if (!isPlatformBrowser(platformId)) {
    console.log('AuthGuard - Running on server, allowing access');
    return true;
  }

  // On first navigation after page load, give a brief moment for localStorage to be ready
  // This handles hydration timing issues
  if (isFirstNavigation) {
    console.log('AuthGuard - First navigation, allowing for hydration');
    isFirstNavigation = false;
    // Allow the route to load; the component will handle auth checks
    return true;
  }

  console.log('AuthGuard - Checking access to:', state.url);
  const isLoggedIn = authService.isLoggedIn();
  console.log('AuthGuard - User logged in:', isLoggedIn);

  if (isLoggedIn) {
    console.log('AuthGuard - Access granted');
    return true;
  }

  console.log('AuthGuard - Access denied, redirecting to /login');
  // Store the attempted URL for redirecting after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
