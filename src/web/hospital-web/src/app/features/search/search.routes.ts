import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SEARCH_ROUTES: Routes = [
  { 
    path: 'doctors', 
    loadComponent: () => import('./doctors-search.component').then(m => m.DoctorsSearchComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'patients', 
    loadComponent: () => import('./patients-search.component').then(m => m.PatientsSearchComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'records', 
    loadComponent: () => import('./records-search.component').then(m => m.RecordsSearchComponent),
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: 'doctors', pathMatch: 'full' }
];