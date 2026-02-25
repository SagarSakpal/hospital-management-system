import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicalRecordsService } from '../../core/services/medical-records.service';
import { MedicalRecordDto } from '../../shared/models/medical-record.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-records-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    DatePipe
  ],
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.scss']
})
export class RecordListComponent implements OnInit {
  role: string | null = null;
  mode: 'all' | 'patient' | 'doctor' = 'all';
  refId: number = 0; // patientId or doctorId (0 for 'all')
  includeArchived = true; // Changed to true to show archived records by default

  rows: MedicalRecordDto[] = [];
  filteredRows: MedicalRecordDto[] = [];
  loading = false;
  searchTerm: string = '';

  get displayedColumns(): string[] {
    if (this.mode === 'all') {
      return ['createdOn', 'patientId', 'doctorId', 'recordType', 'description', 'attachment', 'status', 'actions'];
    }
    return ['createdOn', 'recordType', 'description', 'attachment', 'status', 'actions'];
  }

  constructor(
    private svc: MedicalRecordsService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private auth: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();

    // Dismiss any existing snackbars immediately
    this.snack.dismiss();

    console.log('User role:', this.role);

    // Determine mode by route
    const patientId = this.route.snapshot.paramMap.get('patientId');
    const doctorId = this.route.snapshot.paramMap.get('doctorId');
    
    if (patientId) {
      this.mode = 'patient';
      this.refId = +patientId;
    } else if (doctorId) {
      this.mode = 'doctor';
      this.refId = +doctorId;
    } else {
      this.mode = 'all';
      this.refId = 0;
    }

    // Small delay to ensure token is loaded from localStorage after hydration
    setTimeout(() => {
      this.fetch();
    }, 50);
  }

  canManage(): boolean {
    return this.role === 'Admin' || this.role === 'Doctor' || this.role === 'Nurse';
  }

  fetch() {
    this.loading = true;
    this.cdr.detectChanges(); // Trigger change detection immediately
    this.snack.dismiss(); // Dismiss any existing error messages
    const done = () => {
      this.loading = false;
      console.log('Setting loading to false');
    };

    // If patient is trying to access 'all' mode, redirect to their own records
    if (this.mode === 'all' && this.role === 'Patient') {
      console.log('=== Patient role detected in fetch() ===');
      const userId = this.auth.getUserId();
      console.log('Auth.getUserId() returned:', userId);
      if (userId) {
        console.log('Patient accessing records - switching to patient mode with ID:', userId);
        this.mode = 'patient';
        this.refId = userId;
      } else {
        console.error('===PATIENT USER ID NOT FOUND===');
        console.error('Cannot load medical records without patient ID');
        done();
        this.cdr.detectChanges();
        this.snack.open('Unable to load records - please log out and log in again', 'OK', { duration: 5000 });
        return;
      }
    }

    if (this.mode === 'all') {
      console.log('Fetching all records');
      console.log('User role:', this.role);
      this.svc.listAll(this.includeArchived).subscribe({
        next: list => { 
          console.log('Received all records:', JSON.stringify(list, null, 2));
          console.log('Number of records:', list?.length);
          console.log('Type of response:', typeof list, Array.isArray(list));
          if (list && list.length > 0) {
            console.log('First record:', list[0]);
          }
          this.rows = list || [];
          this.filteredRows = [...(list || [])];
          console.log('Rows array after assignment:', this.rows);
          console.log('Rows length:', this.rows.length);
          console.log('Loading state:', this.loading);
          done();
          this.cdr.detectChanges();
          console.log('After change detection - Loading:', this.loading);
        },
        error: err => { 
          console.error('Failed to load all records:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error
          });
          done();
          
          // Don't show error message for 401, let the interceptor handle it
          if (err.status === 401) {
            console.warn('Unauthorized access detected');
            return;
          }
          
          const errorMsg = err.error?.detail || err.error?.title || err.message || 'Failed to load all records';
          this.snack.open(errorMsg, 'Close', { duration: 5000 }); 
        }
      });
    } else if (this.mode === 'patient') {
      console.log('Fetching records for patient:', this.refId);
      this.svc.listByPatient(this.refId, this.includeArchived).subscribe({
        next: list => { 
          console.log('Received patient records:', JSON.stringify(list, null, 2));
          console.log('Number of records:', list?.length);
          console.log('Type of response:', typeof list, Array.isArray(list));
          if (list && list.length > 0) {
            console.log('First record:', list[0]);
          }
          this.rows = list || [];
          this.filteredRows = [...(list || [])];
          console.log('Patient records - rows.length:', this.rows.length);
          console.log('Patient records - filteredRows.length:', this.filteredRows.length);
          done();
          this.cdr.detectChanges();
          console.log('Patient records - Change detection triggered');
        },
        error: err => { 
          console.error('Failed to load patient records:', err);
          done();
          this.cdr.detectChanges();
          this.snack.open('Failed to load patient records', 'OK', { duration: 3000 }); 
        }
      });
    } else {
      console.log('Fetching records for doctor:', this.refId);
      this.svc.listByDoctor(this.refId, this.includeArchived).subscribe({
        next: list => { 
          console.log('Received doctor records:', list);
          console.log('Number of records:', list?.length);
          console.log('Type of response:', typeof list, Array.isArray(list));
          this.rows = list || [];
          this.filteredRows = [...(list || [])];
          console.log('Doctor records - rows.length:', this.rows.length);
          console.log('Doctor records - filteredRows.length:', this.filteredRows.length);
          done();
          this.cdr.detectChanges();
        },
        error: err => { 
          console.error('Failed to load doctor records:', err);
          done();
          this.cdr.detectChanges();
          this.snack.open('Failed to load doctor records', 'OK', { duration: 3000 }); 
        }
      });
    }
  }

  toggleArchived() {
    this.includeArchived = !this.includeArchived;
    this.fetch();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter(r => 
      r.patientId?.toString().includes(term) ||
      r.patientName?.toLowerCase().includes(term) ||
      r.doctorId?.toString().includes(term) ||
      r.doctorName?.toLowerCase().includes(term) ||
      r.recordType?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  view(id: number) {
    this.router.navigate(['/records', id, 'view']);
  }

  edit(id: number) {
    if (!this.canManage()) return;
    this.router.navigate(['/records', id, 'edit']);
  }

  remove(id: number) {
    if (!this.canManage()) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete record?', message: 'This is a soft delete. Continue?' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.svc.softDelete(id).subscribe({
        next: _ => { 
          // Immediately remove the record from the local arrays for instant UI update
          this.rows = this.rows.filter(r => r.id !== id);
          this.filteredRows = this.filteredRows.filter(r => r.id !== id);
          
          // Trigger change detection
          this.cdr.detectChanges();
          
          // Show success message
          this.snack.open('Record deleted', 'OK', { duration: 2000 });
        },
        error: err => this.snack.open(err?.error?.detail || 'Delete failed', 'OK', { duration: 3000 })
      });
    });
  }

  add() {
    if (!this.canManage()) return;
    this.router.navigate(['/records/new']);
  }

  openAttachment(recordId: number): void {
    const downloadUrl = `${environment.apiBaseUrl}/medical-records/${recordId}/attachment`;
    
    this.http.get(downloadUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (blob.type.includes('html')) {
          console.error('Received HTML instead of file');
          this.snack.open('Failed to download attachment', 'OK', { duration: 3000 });
          return;
        }
        
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      },
      error: (err) => {
        console.error('Failed to download attachment:', err);
        this.snack.open('Failed to open attachment', 'OK', { duration: 3000 });
      }
    });
  }
}