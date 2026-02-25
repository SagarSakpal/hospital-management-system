import { Routes } from '@angular/router';
import { RecordListComponent } from './record-list.component';
import { RecordEditComponent } from './record-edit.component';
import { RecordViewComponent } from './record-view.component';
import { authGuard } from '../../core/guards/auth.guard';

export const RECORDS_ROUTES: Routes = [
  // list variants
  { path: '', component: RecordListComponent, canActivate: [authGuard] }, // all records
  { path: 'patient/:patientId', component: RecordListComponent, canActivate: [authGuard] },
  { path: 'doctor/:doctorId', component: RecordListComponent, canActivate: [authGuard] },

  // create/edit/view
  { path: 'new', component: RecordEditComponent, canActivate: [authGuard] },
  { path: ':id/edit', component: RecordEditComponent, canActivate: [authGuard] },
  { path: ':id/view', component: RecordViewComponent, canActivate: [authGuard] }
];
