import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PATIENTS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./list.component').then(m => m.PatientListComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'new', 
    loadComponent: () => import('./edit.component').then(m => m.PatientEditComponent),
    canActivate: [authGuard] 
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./edit.component').then(m => m.PatientEditComponent),
    canActivate: [authGuard] 
  },
];