import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DOCTORS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./list.component').then(m => m.DoctorListComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./edit.component').then(m => m.DoctorEditComponent),
    canActivate: [authGuard] 
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./edit.component').then(m => m.DoctorEditComponent),
    canActivate: [authGuard] 
  },
];