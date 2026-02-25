import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const RELATIONSHIPS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./manage.component').then(m => m.ManageRelationshipsComponent),
    canActivate: [authGuard] 
  }
];