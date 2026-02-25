import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DoctorsService, DoctorDto } from '../../core/services/doctors.service';
import { PatientsService, PatientDto } from '../../core/services/patients.service';
import { RelationshipsService, DoctorPatientDto } from '../../core/services/relationships.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-manage-relationships',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageRelationshipsComponent implements OnInit {
  role: string | null = null;

  doctors: DoctorDto[] = [];
  patients: PatientDto[] = [];
  doctorLinks: DoctorPatientDto[] = [];
  patientLinks: DoctorPatientDto[] = [];

  form!: ReturnType<typeof this.createForm>;

  constructor(
    private fb: FormBuilder,
    private doctorsSvc: DoctorsService,
    private patientsSvc: PatientsService,
    private relSvc: RelationshipsService,
    private snack: MatSnackBar,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      doctorId: [null as number | null, Validators.required],
      patientId: [null as number | null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.role = this.auth.getRole();

    // Doctors can only view relationships, not manage them
    if (this.role === 'Doctor') {
      console.log('Doctor logged in - read-only access to relationships');
    }

    // Load lists
    this.doctorsSvc.list().subscribe({ next: d => this.doctors = d });
    this.patientsSvc.list().subscribe({ next: p => this.patients = p });

    // React to selections to load links
    this.form.get('doctorId')!.valueChanges.subscribe(id => { if (id) this.loadDoctorLinks(id); });
    this.form.get('patientId')!.valueChanges.subscribe(id => { if (id) this.loadPatientLinks(id); });
  }

  canManage() { return this.role === 'Admin' || this.role === 'Nurse'; }

  loadDoctorLinks(id: number) {
    console.log('Loading patients for doctor:', id);
    this.relSvc.getPatientsForDoctor(id).subscribe({
      next: links => {
        console.log('Patients loaded:', links);
        this.doctorLinks = [...links];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading patients:', err);
        this.snack.open('Failed to load patients', 'OK', { duration: 2000 });
      }
    });
  }
  
  loadPatientLinks(id: number) {
    console.log('Loading doctors for patient:', id);
    this.relSvc.getDoctorsForPatient(id).subscribe({
      next: links => {
        console.log('Doctors loaded:', links);
        this.patientLinks = [...links];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading doctors:', err);
        this.snack.open('Failed to load doctors', 'OK', { duration: 2000 });
      }
    });
  }

  assign() {
    if (!this.canManage()) { 
      this.snack.open('Not authorized', 'OK', { duration: 2500 }); 
      return; 
    }
    if (this.form.invalid) { 
      this.snack.open('Pick a doctor and a patient', 'OK', { duration: 2500 }); 
      return; 
    }

    const { doctorId, patientId } = this.form.value;
    console.log('=== ASSIGN START ===');
    console.log('Assigning:', { doctorId, patientId });
    console.log('doctorLinks BEFORE:', JSON.parse(JSON.stringify(this.doctorLinks)));
    console.log('patientLinks BEFORE:', JSON.parse(JSON.stringify(this.patientLinks)));
    
    this.relSvc.assign({ doctorId: doctorId!, patientId: patientId! }).subscribe({
      next: response => {
        console.log('Assign API Response:', response);
        this.snack.open('Assigned', 'OK', { duration: 2000 });
        
        // Create a new link object (we don't know the ID yet, so use a temporary one)
        const newLink: DoctorPatientDto = {
          id: Date.now(), // temporary ID
          doctorId: doctorId!,
          patientId: patientId!,
          isActive: true
        };
        
        // Add the new link to both arrays
        this.doctorLinks = [...this.doctorLinks, newLink];
        this.patientLinks = [...this.patientLinks, newLink];
        
        console.log('doctorLinks AFTER:', JSON.parse(JSON.stringify(this.doctorLinks)));
        console.log('patientLinks AFTER:', JSON.parse(JSON.stringify(this.patientLinks)));
        console.log('=== ASSIGN END ===');
        
        // Force change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Assign error:', err);
        const msg = err?.error?.detail || err?.error?.message || err?.message || 'Assign failed';
        this.snack.open(msg, 'OK', { duration: 3000 });
      }
    });
  }

  unassign(link: DoctorPatientDto) {
    if (!this.canManage()) { 
      this.snack.open('Not authorized', 'OK', { duration: 2500 }); 
      return; 
    }
    
    console.log('=== UNASSIGN START ===');
    console.log('Link to unassign:', link);
    console.log('doctorLinks BEFORE:', JSON.parse(JSON.stringify(this.doctorLinks)));
    console.log('patientLinks BEFORE:', JSON.parse(JSON.stringify(this.patientLinks)));
    
    this.relSvc.unassign({ doctorId: link.doctorId, patientId: link.patientId }).subscribe({
      next: response => {
        console.log('API Response:', response);
        
        // Create completely new arrays without the unassigned link
        const newDoctorLinks = this.doctorLinks.filter(l => 
          !(l.doctorId === link.doctorId && l.patientId === link.patientId)
        );
        const newPatientLinks = this.patientLinks.filter(l => 
          !(l.doctorId === link.doctorId && l.patientId === link.patientId)
        );
        
        console.log('newDoctorLinks:', JSON.parse(JSON.stringify(newDoctorLinks)));
        console.log('newPatientLinks:', JSON.parse(JSON.stringify(newPatientLinks)));
        
        // Assign the new arrays
        this.doctorLinks = [...newDoctorLinks];
        this.patientLinks = [...newPatientLinks];
        
        console.log('doctorLinks AFTER assignment:', JSON.parse(JSON.stringify(this.doctorLinks)));
        console.log('patientLinks AFTER assignment:', JSON.parse(JSON.stringify(this.patientLinks)));
        console.log('=== UNASSIGN END ===');
        
        this.snack.open('Unassigned', 'OK', { duration: 2000 });
        
        // Force change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Unassign error:', err);
        const msg = err?.error?.detail || err?.error?.message || err?.message || 'Unassign failed';
        this.snack.open(msg, 'OK', { duration: 3000 });
      }
    });
  }

  getPatientName(id: number): string {
    return this.patients.find(p => p.id === id)?.name || `Patient #${id}`;
  }

  getDoctorName(id: number): string {
    return this.doctors.find(d => d.id === id)?.name || `Doctor #${id}`;
  }
}
