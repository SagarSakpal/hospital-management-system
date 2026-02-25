import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { PatientsService, PatientDto } from '../../core/services/patients.service';
import { RelationshipsService } from '../../core/services/relationships.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-patient-list',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
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
export class PatientListComponent implements OnInit {
  role: string | null = null;
  rows: PatientDto[] = [];
  filteredRows: PatientDto[] = [];
  displayedColumns = ['name','dob','gender','condition','contact','actions'];
  loading = false;
  searchTerm: string = '';

  constructor(
    private patients: PatientsService,
    private relationships: RelationshipsService,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    console.log('Patient List - User role:', this.role);
    console.log('Patient List - Is logged in:', this.auth.isLoggedIn());
    
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.load();
    }, 0);
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges();
    console.log('Patient List - Loading patients...');
    this.patients.list().subscribe({
      next: d => { 
        console.log('Patient List - Loaded patients:', d);
        this.rows = d;
        this.filteredRows = [...d];
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: err => { 
        console.error('Patient List - Error loading patients:', err);
        console.error('Patient List - Error status:', err.status);
        console.error('Patient List - Error body:', err.error);
        this.loading = false; 
        this.cdr.detectChanges();
        
        let errorMsg = 'Failed to load patients';
        if (err.status === 0) {
          errorMsg = 'Cannot connect to API. Is the backend running?';
        } else if (err.status === 401) {
          errorMsg = 'Unauthorized. Please log in again.';
        } else if (err.status === 403) {
          errorMsg = 'Forbidden. You do not have permission to view patients.';
        } else if (err.error?.message) {
          errorMsg = `Error: ${err.error.message}`;
        }
        
        this.snack.open(errorMsg, 'OK', { duration: 5000 }); 
      }
    });
  }

  canManage() { return this.role === 'Admin' || this.role === 'Nurse'; }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.gender?.toLowerCase().includes(term) ||
      p.contact?.toLowerCase().includes(term) ||
      p.condition?.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  add() { this.router.navigate(['/patients/new']); }
  edit(id: number) { this.router.navigate(['/patients', id, 'edit']); }

  remove(id: number) {
    // First check if patient has active relationships
    this.relationships.getDoctorsForPatient(id).subscribe({
      next: activeRelationships => {
        if (activeRelationships.length > 0) {
          this.snack.open(
            `Cannot delete patient. They are currently assigned to ${activeRelationships.length} doctor(s). Please unassign them first.`,
            'OK',
            { duration: 5000 }
          );
          return;
        }
        
        // No active relationships, proceed with delete
        const ref = this.dialog.open(ConfirmDialogComponent, {
          data: { title: 'Delete patient?', message: 'This performs a soft delete. Continue?' }
        });
        ref.afterClosed().subscribe(ok => {
          if (!ok) return;
          this.patients.softDelete(id).subscribe({
            next: () => { 
              // Immediately remove the patient from the local arrays for instant UI update
              this.rows = this.rows.filter(r => r.id !== id);
              this.filteredRows = this.filteredRows.filter(r => r.id !== id);
              
              // Trigger change detection
              this.cdr.detectChanges();
              
              // Show success message
              this.snack.open('Patient deleted', 'OK', { duration: 2000 });
            },
            error: err => this.snack.open(err?.error?.detail || 'Delete failed', 'OK', { duration: 3000 })
          });
        });
      },
      error: err => {
        console.error('Error checking patient relationships:', err);
        this.snack.open('Failed to verify patient relationships', 'OK', { duration: 3000 });
      }
    });
  }
}