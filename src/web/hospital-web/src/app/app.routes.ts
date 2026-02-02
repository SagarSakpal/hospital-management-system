import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },

  // Protected areas (to be implemented)
  // { 
  //   path: 'admin', 
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  // },
  // { 
  //   path: 'doctor', 
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./features/doctor/doctor.routes').then(m => m.DOCTOR_ROUTES)
  // },
  // { 
  //   path: 'patient', 
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  // },
  // { 
  //   path: 'receptionist', 
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./features/receptionist/receptionist.routes').then(m => m.RECEPTIONIST_ROUTES)
  // },

  // Default
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
