import { Routes } from '@angular/router';
import { BookingComponent } from './booking.component';
import { AppointmentListComponent } from './list.component';
import { authGuard } from '../../core/guards/auth.guard';

export const APPOINTMENTS_ROUTES: Routes = [
  { path: 'book', component: BookingComponent, canActivate: [authGuard] },
  { path: 'list', component: AppointmentListComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
];
