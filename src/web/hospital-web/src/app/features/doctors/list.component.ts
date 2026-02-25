import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DoctorsService, DoctorDto } from '../../core/services/doctors.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-doctor-list',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class DoctorListComponent implements OnInit {
  role: string | null = null;
  rows: DoctorDto[] = [];
  filteredRows: DoctorDto[] = [];
  displayedColumns = ['name','specialization','experience','contact','actions'];
  loading = false;
  searchTerm: string = '';

  constructor(
    private doctors: DoctorsService,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    console.log('Doctor List - User role:', this.role);
    console.log('Doctor List - Is logged in:', this.auth.isLoggedIn());
    
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.load();
    }, 0);
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges(); // Trigger change detection
    console.log('Doctor List - Loading doctors...');
    this.doctors.list().subscribe({
      next: d => { 
        console.log('Doctor List - Loaded doctors:', d);
        this.rows = d;
        this.filteredRows = [...d];
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: err => { 
        console.error('Doctor List - Error loading doctors:', err);
        console.error('Doctor List - Error status:', err.status);
        console.error('Doctor List - Error message:', err.message);
        console.error('Doctor List - Error body:', err.error);
        this.loading = false; 
        this.cdr.detectChanges();
        
        let errorMsg = 'Failed to load doctors';
        if (err.status === 0) {
          errorMsg = 'Cannot connect to API. Is the backend running?';
        } else if (err.status === 401) {
          errorMsg = 'Unauthorized. Please log in again.';
        } else if (err.status === 403) {
          errorMsg = 'Forbidden. You do not have permission to view doctors.';
        } else if (err.error?.message) {
          errorMsg = `Error: ${err.error.message}`;
        }
        
        this.snack.open(errorMsg, 'OK', { duration: 5000 }); 
      }
    });
  }

  canManage() { return this.role === 'Admin'; }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter(d => 
      d.name.toLowerCase().includes(term) ||
      d.specializationId?.toString().includes(term) ||
      d.contact?.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  add() { this.router.navigate(['/doctors/new']); }
  edit(id: number) { this.router.navigate(['/doctors', id, 'edit']); }

  remove(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete doctor?', message: 'This performs a soft delete. Continue?' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.doctors.softDelete(id).subscribe({
        next: () => { 
          // Immediately remove the doctor from the local arrays for instant UI update
          this.rows = this.rows.filter(r => r.id !== id);
          this.filteredRows = this.filteredRows.filter(r => r.id !== id);
          
          // Trigger change detection
          this.cdr.detectChanges();
          
          // Show success message
          this.snack.open('Doctor deleted', 'OK', { duration: 2000 });
        },
        error: err => {
          const msg = err?.error?.detail || 'Delete failed';
          this.snack.open(msg, 'OK', { duration: 3000 });
        }
      });
    });
  }
}