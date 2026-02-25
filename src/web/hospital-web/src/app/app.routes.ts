import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },

  // Appointments
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES)
  },

  // Doctors
  {
    path: 'doctors',
    canActivate: [authGuard],
    loadChildren: () => import('./features/doctors/doctors.routes').then(m => m.DOCTORS_ROUTES)
  },

  // Patients
  {
    path: 'patients',
    canActivate: [authGuard],
    loadChildren: () => import('./features/patients/patients.routes').then(m => m.PATIENTS_ROUTES)
  },

  // Doctor-Patient Relationships
  {
    path: 'relationships',
    canActivate: [authGuard],
    loadChildren: () => import('./features/relationships/relationships.routes').then(m => m.RELATIONSHIPS_ROUTES)
  },

  // Medical Records
  {
    path: 'records',
    canActivate: [authGuard],
    loadChildren: () => import('./features/records/records.routes').then(m => m.RECORDS_ROUTES)
  },

  // Search
  {
    path: 'search',
    canActivate: [authGuard],
    loadChildren: () => import('./features/search/search.routes').then(m => m.SEARCH_ROUTES)
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
