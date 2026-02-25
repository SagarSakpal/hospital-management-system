import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicalRecordsService
} from '../../core/services/medical-records.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorsService, DoctorDto } from '../../core/services/doctors.service';
import { PatientsService, PatientDto } from '../../core/services/patients.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-record-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './record-edit.component.html',
  styleUrls: ['./record-edit.component.scss']
})
export class RecordEditComponent implements OnInit {

  id: number | null = null;
  loading = false;
  uploading = false;
  role: string | null = null;

  doctors: DoctorDto[] = [];
  patients: PatientDto[] = [];

  // Create/Update form
  form!: ReturnType<typeof this.createForm>;

  attachmentUrl: string | null | undefined = null; // preview if existing (after load)
  fileToUpload: File | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: MedicalRecordsService,
    private doctorsSvc: DoctorsService,
    private patientsSvc: PatientsService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private auth: AuthService
  ) {
    this.form = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      patientId: [null as number | null, [Validators.required]],
      doctorId: [null as number | null, [Validators.required]],
      recordType: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.role = this.auth.getRole();

    // Restrict access: only Admin, Doctor, and Nurse can edit medical records
    if (this.role === 'Patient') {
      this.snack.open('You do not have permission to edit medical records', 'OK', { duration: 3000 });
      this.router.navigate(['/records']);
      return;
    }

    this.doctorsSvc.list().subscribe({ next: d => this.doctors = d });
    this.patientsSvc.list().subscribe({ next: p => this.patients = p });

    const maybeId = this.route.snapshot.paramMap.get('id');
    if (maybeId) {
      this.id = +maybeId;
      this.load();
    }
  }

  load() {
    if (!this.id) return;
    this.loading = true;
    this.svc.get(this.id).subscribe({
      next: r => {
        this.form.patchValue({
          patientId: r.patientId,
          doctorId: r.doctorId,
          recordType: r.recordType,
          description: r.description
        });
        this.attachmentUrl = r.attachmentUrl;
        this.loading = false;
      },
      error: _ => { this.loading = false; this.snack.open('Failed to load record','OK',{duration:3000}); }
    });
  }

  save() {
    if (this.form.invalid) {
      this.snack.open('Fill required fields', 'OK', { duration: 2500 });
      return;
    }
    this.loading = true;

    if (!this.id) {
      // create
      this.svc.create(this.form.value as any).subscribe({
        next: created => {
          this.loading = false;
          this.snack.open('Record created', 'OK', { duration: 2000 });
          // After create, if user has picked a file, upload it
          if (this.fileToUpload) {
            this.upload(created.id);
          } else {
            // Navigate back to main records list
            this.router.navigate(['/records']);
          }
        },
        error: err => { this.loading = false; this.snack.open(err?.error?.detail || 'Create failed','OK',{duration:3000}); }
      });
    } else {
      // update
      const payload = {
        recordType: this.form.value.recordType!,
        description: this.form.value.description!
      };
      this.svc.update(this.id, payload).subscribe({
        next: updated => {
          this.loading = false;
          this.snack.open('Record updated', 'OK', { duration: 2000 });
          // Upload if a new file chosen
          if (this.fileToUpload) {
            this.upload(updated.id);
          } else {
            // Navigate back to main records list
            this.router.navigate(['/records']);
          }
        },
        error: err => { this.loading = false; this.snack.open(err?.error?.detail || 'Update failed','OK',{duration:3000}); }
      });
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    console.log('File input changed:', input);
    console.log('Files:', input.files);
    
    if (!input.files || input.files.length === 0) { 
      console.log('No file selected');
      this.fileToUpload = null; 
      return; 
    }
    
    this.fileToUpload = input.files[0];
    console.log('File selected:', this.fileToUpload.name, 'Size:', this.fileToUpload.size, 'Type:', this.fileToUpload.type);
    this.snack.open(`File "${this.fileToUpload.name}" selected`, 'OK', { duration: 2000 });
  }

  upload(recordId: number) {
    if (!this.fileToUpload) {
      console.log('No file to upload');
      return;
    }
    
    console.log('Starting upload for record:', recordId, 'File:', this.fileToUpload.name);
    this.uploading = true;
    this.svc.uploadAttachment(recordId, this.fileToUpload).subscribe({
      next: url => {
        console.log('Upload successful. URL:', url);
        this.uploading = false;
        this.snack.open('Attachment uploaded successfully', 'OK', { duration: 2000 });
        // Navigate back to main records list after upload
        this.router.navigate(['/records']);
      },
      error: err => {
        console.error('Upload failed:', err);
        this.uploading = false;
        const errorMsg = err?.error?.detail || err?.error?.message || err?.message || 'Upload failed';
        this.snack.open(errorMsg, 'OK', { duration: 4000 });
        // Still navigate back even if upload fails
        this.router.navigate(['/records']);
      }
    });
  }
}