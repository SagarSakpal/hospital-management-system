import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DoctorsService } from '../../core/services/doctors.service';
import { PatientsService } from '../../core/services/patients.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { Doctor } from '../../shared/models/doctor.model';
import { Patient } from '../../shared/models/patient.model';
import { Appointment } from '../../shared/models/appointment.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterLink, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { LookupService, DoctorLiteDto } from '../../core/services/lookup.service';

@Component({
  selector: 'app-booking',
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
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  doctors: Doctor[] = [];
  patients: Patient[] = [];
  loading = false;
  

  // Selected-day existing appointments for chosen doctor
  existingAppointments: Appointment[] = [];

  // Working hours (you can externalize to config)
  startHour = 9;
  endHour = 17; // exclusive -> 17 means last slot starts at 16:00

  // Signals (fine with Angular 16/17+; otherwise use RxJS/Subject)
  selectedDate = signal<Date | null>(null);
  selectedDoctorId = signal<number | null>(null);

  // Slots derived from selected date & existingAppointments
  slots = computed(() => {
    const d = this.selectedDate();
    if (!d) return [];
    const dayUTC = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
    const out: { label: string; startISO: string; taken: boolean }[] = [];

    for (let hour = this.startHour; hour < this.endHour; hour++) {
      // Build a UTC ISO string at exact hour
      const slot = new Date(dayUTC);
      slot.setUTCHours(hour, 0, 0, 0);
      const startISO = slot.toISOString();
      const label = `${hour.toString().padStart(2, '0')}:00`;

      // Determine if taken: if any existing appt overlaps [start, start+1h)
      const end = new Date(slot);
      end.setUTCHours(hour + 1, 0, 0, 0);

      const taken = this.existingAppointments.some(a => {
        const aStart = new Date(a.startTime);
        const aEnd = new Date(a.endTime);
        return slot < aEnd && aStart < end; // overlap rule
      });

      out.push({ label, startISO, taken });
    }
    return out;
  });

  // Reactive form
  form!: FormGroup;

  role: string | null = null;

  // Date filter to disable past dates in the calendar
  dateFilter = (date: Date | null): boolean => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= today;
  };

  constructor(
    private fb: FormBuilder,
    private doctorsSvc: DoctorsService,
    private patientsSvc: PatientsService,
    private apptsSvc: AppointmentsService,
    private snack: MatSnackBar,
    private auth: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {
    // Initialize form in constructor
    this.form = this.fb.group({
      doctorId: [null as number | null, Validators.required],
      date: [null as Date | null, Validators.required],
      patientId: [null as number | null], // required for Admin/Doctor/Nurse; for Patient role we'll set automatically later
      notes: [''],
      startTimeISO: [null as string | null, Validators.required] // hidden control bound to picked slot
    });
  }

  ngOnInit(): void {
    this.role = this.auth.getRole();

    // Restrict access: only Admin and Nurse can book appointments
    if (this.role === 'Doctor' || this.role === 'Patient') {
      this.snack.open('You do not have permission to book appointments', 'OK', { duration: 3000 });
      this.router.navigate(['/appointments']);
      return;
    }

    this.loadDoctors();
    // Load patients list always (for displaying in existing appointments table)
    this.loadPatients();

    // React to doctor/date changes
    this.form.get('doctorId')!.valueChanges.subscribe((val: number | null) => {
      this.selectedDoctorId.set(val);
      this.tryLoadExisting();
    });
    this.form.get('date')!.valueChanges.subscribe((val: Date | null) => {
      if (val) {
        // Check if selected date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(val);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          this.snack.open('⚠️ Cannot select a past date. Please choose today or a future date.', 'OK', { 
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
          // Clear the date and slot selection
          this.form.patchValue({ 
            date: null,
            startTimeISO: null 
          }, { emitEvent: false });
          this.selectedDate.set(null);
          this.existingAppointments = [];
          return;
        }
      }
      
      this.selectedDate.set(val);
      this.tryLoadExisting();
    });
  }

  loadDoctors() {
    this.doctorsSvc.list().subscribe({
      next: d => this.doctors = d,
      error: err => this.snack.open('Failed to load doctors', 'OK', { duration: 3000 })
    });
  }

  loadPatients() {
    this.patientsSvc.list().subscribe({
      next: p => this.patients = p,
      error: err => this.snack.open('Failed to load patients', 'OK', { duration: 3000 })
    });
  }

  tryLoadExisting() {
    const docId = this.selectedDoctorId();
    const d = this.selectedDate();
    if (!docId || !d) { this.existingAppointments = []; return; }

    // Build YYYY-MM-DD (UTC) for backend query
    const y = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    this.apptsSvc.listDoctorDay(docId, dateStr).subscribe({
      next: list => this.existingAppointments = list ?? [],
      error: _ => {
        this.existingAppointments = [];
        this.snack.open('Failed to load existing appointments for this day', 'OK', { duration: 3000 });
      }
    });
  }

  pickSlot(slotISO: string, disabled: boolean) {
    if (disabled) return;
    this.form.patchValue({ startTimeISO: slotISO });
  }

  // For Patient role, you may later auto-detect patientId from /auth/me + /patients?userId=...
  // For now, if role === 'Patient', require selection or configure a simple fallback.

  submit() {
    if (this.form.invalid) {
      this.snack.open('Fill all required fields and choose a free slot.', 'OK', { duration: 3000 });
      return;
    }

    const val = this.form.value;
    const doctorName = this.doctors.find(d => d.id === val.doctorId)?.name || 'Unknown';
    const patientName = this.patients.find(p => p.id === val.patientId)?.name || 'Unknown';
    const slotTime = this.slots().find(s => s.startISO === val.startTimeISO)?.label || '';
    const dateStr = this.selectedDate()?.toLocaleDateString() || '';

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Booking',
        message: `Book appointment for ${patientName} with Dr. ${doctorName} on ${dateStr} at ${slotTime}?`,
        okText: 'Book',
        cancelText: 'Cancel'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      const payload = {
        doctorId: val.doctorId!,
        patientId: val.patientId!,
        startTime: val.startTimeISO!,
        notes: val.notes || undefined
      };

      this.loading = true;
      this.apptsSvc.create(payload).subscribe({
        next: created => {
          this.loading = false;
          this.snack.open('✓ Appointment booked successfully!', 'OK', { duration: 3000 });
          
          // Refresh the existing appointments list to show the newly booked appointment
          this.tryLoadExisting();
          
          // Clear only the slot selection and notes, keep doctor/date/patient for easy rebooking
          this.form.patchValue({
            startTimeISO: null,
            notes: ''
          });
        },
        error: err => {
          this.loading = false;
          const msg = err?.error?.detail || err?.error || 'Booking failed';
          this.snack.open(msg, 'OK', { duration: 4000 });
        }
      });
    });
  }

  getPatientName(patientId: number): string {
    return this.patients.find(p => p.id === patientId)?.name || `Patient #${patientId}`;
  }
}