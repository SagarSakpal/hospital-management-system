import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppointmentsService } from '../../core/services/appointments.service';
import { DoctorsService } from '../../core/services/doctors.service';
import { PatientsService } from '../../core/services/patients.service';
import { Appointment } from '../../shared/models/appointment.model';
import { Doctor } from '../../shared/models/doctor.model';
import { Patient } from '../../shared/models/patient.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AppointmentListComponent implements OnInit, AfterViewInit {

  role: string | null = null;

  doctors: Doctor[] = [];
  patients: Patient[] = [];
  data = new MatTableDataSource<Appointment>([]);
  displayedColumns = ['start', 'end', 'doctor', 'patient', 'status', 'notes', 'actions'];

  loading = false;
  private viewInitialized = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Date range form
  form!: any;

  constructor(
    private fb: FormBuilder,
    private apptSvc: AppointmentsService,
    private doctorsSvc: DoctorsService,
    private patientsSvc: PatientsService,
    private snack: MatSnackBar,
    private auth: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      from: [null as Date | null, Validators.required],
      to: [null as Date | null, Validators.required],
      doctorId: [null as number | null],
      patientId: [null as number | null],
    });
  }

  ngOnInit(): void {
    this.role = this.auth.getRole();
    console.log('AppointmentListComponent - User role:', this.role);

    // Load lookups if user can pick them
    if (this.role === 'Admin' || this.role === 'Nurse' || this.role === 'Doctor' || this.role === 'Patient') {
      this.doctorsSvc.list().subscribe({
        next: d => {
          this.doctors = d;
          console.log('Loaded doctors:', d.length);
        },
        error: err => console.error('Error loading doctors:', err)
      });
    }
    if (this.role === 'Admin' || this.role === 'Nurse' || this.role === 'Patient' || this.role === 'Doctor') {
      this.patientsSvc.list().subscribe({
        next: p => {
          this.patients = p;
          console.log('Loaded patients:', p.length);
        },
        error: err => console.error('Error loading patients:', err)
      });
    }

    // Provide a sensible default date range: today → +7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    this.form.patchValue({ from: today, to: nextWeek });
  }

  ngAfterViewInit(): void {
    this.data.paginator = this.paginator;
    this.viewInitialized = true;
    
    // Load data after view is initialized for all roles
    if (this.role === 'Admin' || this.role === 'Nurse' || this.role === 'Doctor' || this.role === 'Patient') {
      console.log('Auto-loading appointments for', this.role, 'after view init');
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.loadAllAppointments();
      }, 0);
    } else {
      console.log('Not auto-loading appointments. Role:', this.role);
    }
  }

  loadAllAppointments() {
    this.loading = true;
    this.cdr.detectChanges(); // Trigger change detection immediately
    console.log('loadAllAppointments - Starting API call');
    
    // For patients, use patient-specific endpoint
    if (this.role === 'Patient') {
      console.log('=== Patient role detected in loadAllAppointments ===');
      const userId = this.auth.getUserId();
      console.log('Auth.getUserId() returned:', userId);
      if (!userId) {
        console.error('===PATIENT USER ID NOT FOUND===');
        console.error('Cannot load appointments without patient ID');
        this.loading = false;
        this.cdr.detectChanges();
        this.snack.open('Unable to load appointments - please log out and log in again', 'OK', { duration: 5000 });
        return;
      }
      console.log('Patient ID successfully retrieved:', userId);
      
      const formVal = this.form.value;
      const fromISO = this.toISODate(formVal.from!);
      const toISO = this.toISODate(formVal.to!);
      
      console.log('Loading appointments for patient:', userId);
      this.apptSvc.listByPatientRange(userId, fromISO, toISO).subscribe({
        next: list => {
          console.log('Patient appointments received:', list.length);
          this.setData(list);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error loading patient appointments:', err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snack.open('Failed to load appointments', 'OK', { duration: 3000 });
        }
      });
      return;
    }
    
    // For Admin, Nurse, Doctor - use listAll
    this.apptSvc.listAll().subscribe({
      next: list => { 
        console.log('Appointments received from API:', list);
        console.log('Number of appointments:', list.length);
        if (list.length > 0) {
          console.log('First appointment:', list[0]);
        }
        
        // Apply date range filter using form values
        const formVal = this.form.value;
        if (formVal.from && formVal.to) {
          const filtered = this.filterByDateRange(list, formVal.from, formVal.to);
          console.log('After applying date range filter:', filtered.length, 'appointments');
          this.setData(filtered);
        } else {
          this.setData(list);
        }
        
        console.log('loadAllAppointments - Setting loading to false');
        this.loading = false;
        console.log('loadAllAppointments - loading flag is now:', this.loading);
        this.cdr.detectChanges();
        console.log('loadAllAppointments - Change detection triggered');
        console.log('Data source length after setData:', this.data.data.length);
      },
      error: err => { 
        console.error('Error loading appointments:', err);
        this.loading = false; 
        this.cdr.detectChanges();
        this.snack.open('Failed to load appointments', 'OK', { duration: 3000 }); 
      }
    });
  }

  fetch() {
    if (this.form.invalid) {
      this.snack.open('Please select a valid date range.', 'OK', { duration: 3000 });
      return;
    }

    const val = this.form.value;
    const fromISO = this.toISODate(val.from!);
    const toISO = this.toISODate(val.to!);

    console.log('Fetch appointments - From:', fromISO, 'To:', toISO, 'Doctor:', val.doctorId, 'Patient:', val.patientId);

    // Role logic:
    // Admin/Nurse: either doctorId or patientId or both (prefer more specific) or all
    // Doctor: choose own doctorId (or preselect)
    // Patient: choose own patientId (or auto-detect)
    this.loading = true;
    this.cdr.detectChanges(); // Trigger change detection immediately

    // Preference: if doctor chosen, list by doctor
    if (val.doctorId) {
      console.log('Fetching by doctor ID:', val.doctorId);
      this.apptSvc.listByDoctorRange(val.doctorId, fromISO, toISO).subscribe({
        next: list => { 
          console.log('Received', list.length, 'appointments for doctor');
          this.setData(list); 
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => { 
          console.error('Error loading appointments for doctor:', err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snack.open('Failed to load appointments for doctor', 'OK', { duration: 3000 }); 
        }
      });
      return;
    }

    // Else if patient chosen, list by patient
    if (val.patientId) {
      console.log('Fetching by patient ID:', val.patientId);
      this.apptSvc.listByPatientRange(val.patientId, fromISO, toISO).subscribe({
        next: list => { 
          console.log('Received', list.length, 'appointments for patient');
          this.setData(list); 
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => { 
          console.error('Error loading appointments for patient:', err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snack.open('Failed to load appointments for patient', 'OK', { duration: 3000 }); 
        }
      });
      return;
    }

    // For Patient role without a specific patient selected, use their own ID
    if (this.role === 'Patient') {
      const userId = this.auth.getUserId();
      if (!userId) {
        console.error('Patient user ID not found for fetch');
        this.loading = false;
        this.cdr.detectChanges();
        this.snack.open('Unable to load appointments - please log out and log in again', 'OK', { duration: 5000 });
        return;
      }
      console.log('Patient fetch - using patient ID:', userId);
      this.apptSvc.listByPatientRange(userId, fromISO, toISO).subscribe({
        next: list => { 
          console.log('Received', list.length, 'appointments for patient');
          this.setData(list); 
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => { 
          console.error('Error loading appointments for patient:', err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snack.open('Failed to load appointments', 'OK', { duration: 3000 }); 
        }
      });
      return;
    }

    // If no filter chosen, show all appointments (filtered by date range) - Admin/Nurse/Doctor only
    if (this.role === 'Admin' || this.role === 'Nurse' || this.role === 'Doctor') {
      console.log('Fetching all appointments and filtering by date range');
      this.apptSvc.listAll().subscribe({
        next: list => { 
          console.log('Received', list.length, 'total appointments');
          // Filter by date range client-side
          const filtered = this.filterByDateRange(list, val.from!, val.to!);
          console.log('After date filter:', filtered.length, 'appointments');
          this.setData(filtered); 
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => { 
          console.error('Error loading all appointments:', err);
          this.loading = false;
          this.cdr.detectChanges();
          this.snack.open('Failed to load all appointments', 'OK', { duration: 3000 }); 
        }
      });
      return;
    }

    // Unknown role
    this.loading = false;
    this.cdr.detectChanges();
    this.snack.open('Unable to load appointments', 'OK', { duration: 3000 });
  }

  setData(list: Appointment[]) {
    try {
      console.log('setData - Starting, received:', list.length, 'appointments');
      if (list.length > 0) {
        console.log('setData - Sample appointment:', list[0]);
      }
      
      // Sort appointments by status: Scheduled > Completed > Cancelled
      const statusOrder: { [key: string]: number } = {
        'Scheduled': 1,
        'Completed': 2,
        'Cancelled': 3
      };
      
      const sortedList = [...list].sort((a, b) => {
        try {
          const orderA = statusOrder[a.status] || 999;
          const orderB = statusOrder[b.status] || 999;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          // If same status, sort by start time (newest first)
          const dateA = new Date(b.startTime).getTime();
          const dateB = new Date(a.startTime).getTime();
          return dateA - dateB;
        } catch (sortError) {
          console.error('Error sorting individual appointments:', sortError, a, b);
          return 0;
        }
      });
      
      console.log('setData - Sorting completed successfully');
      this.data.data = sortedList;
      console.log('setData - Data assigned to table. Length:', this.data.data.length);
      
      // Ensure paginator is connected
      if (this.paginator && this.viewInitialized) {
        this.data.paginator = this.paginator;
        console.log('setData - Paginator connected');
        this.paginator.firstPage();
      }
    } catch (error) {
      console.error('ERROR in setData:', error);
      // Fallback: set data without sorting
      this.data.data = list;
    }
    
    // Note: Parent method will trigger change detection
  }

  toISODate(d: Date): string {
    // YYYY-MM-DD in UTC
    const y = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  filterByDateRange(appointments: Appointment[], fromDate: Date, toDate: Date): Appointment[] {
    // Set time to start of day for fromDate and end of day for toDate
    const startOfDay = new Date(fromDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log('Filtering appointments between:', startOfDay.toISOString(), 'and', endOfDay.toISOString());
    
    return appointments.filter(appt => {
      const apptDate = new Date(appt.startTime);
      const isInRange = apptDate >= startOfDay && apptDate <= endOfDay;
      if (!isInRange) {
        console.log('Excluding appointment:', appt.id, 'with date:', apptDate.toISOString());
      }
      return isInRange;
    });
  }

  canChangeStatus(appt: Appointment): boolean {
    // Only Admin, Nurse, and Doctor can change appointment status
    const hasPermission = this.role === 'Admin' || this.role === 'Nurse' || this.role === 'Doctor';
    return hasPermission && appt.status === 'Scheduled';
  }

  cancel(appt: Appointment) {
    if (!this.canChangeStatus(appt)) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel appointment?',
        message: `Are you sure you want to cancel the appointment starting at ${new Date(appt.startTime).toLocaleString()}?`
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.apptSvc.updateStatus(appt.id, 'Cancelled').subscribe({
        next: updated => {
          // Update in table
          appt.status = updated.status;
          
          // Trigger immediate change detection
          this.cdr.detectChanges();
          
          // Show success message
          this.snack.open('Appointment cancelled', 'OK', { duration: 2500 });
        },
        error: err => {
          const msg = err?.error?.detail || 'Failed to cancel';
          this.snack.open(msg, 'OK', { duration: 3000 });
        }
      });
    });
  }

  complete(appt: Appointment) {
    if (!this.canChangeStatus(appt)) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Complete appointment?',
        message: `Mark the appointment starting at ${new Date(appt.startTime).toLocaleString()} as Completed?`
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.apptSvc.updateStatus(appt.id, 'Completed').subscribe({
        next: updated => {
          // Update status
          appt.status = updated.status;
          
          // Trigger immediate change detection
          this.cdr.detectChanges();
          
          // Show success message
          this.snack.open('Appointment marked as completed', 'OK', { duration: 2500 });
        },
        error: err => {
          const msg = err?.error?.detail || 'Failed to complete';
          this.snack.open(msg, 'OK', { duration: 3000 });
        }
      });
    });
  }

  getDoctorName(doctorId: number): string {
    return this.doctors.find(d => d.id === doctorId)?.name || doctorId.toString();
  }

  getPatientName(patientId: number): string {
    return this.patients.find(p => p.id === patientId)?.name || patientId.toString();
  }
}