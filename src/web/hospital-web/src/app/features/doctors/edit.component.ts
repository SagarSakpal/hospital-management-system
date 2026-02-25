import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CreateDoctorRequest, DoctorsService, UpdateDoctorRequest
} from '../../core/services/doctors.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-doctor-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class DoctorEditComponent implements OnInit {

  id: number | null = null;
  loading = false;
  form!: ReturnType<typeof this.createForm>;

  constructor(
    private fb: FormBuilder,
    private svc: DoctorsService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      userId: ['',[Validators.required]],         // If you create user first; else keep hidden or provide a dropdown
      name: ['',[Validators.required, Validators.maxLength(100)]],
      specializationId: [0,[Validators.required, Validators.min(1)]],
      experienceYears: [0,[Validators.required, Validators.min(0), Validators.max(60)]],
      contact: ['',[Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
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
      next: d => {
        this.form.patchValue({
          userId: d.userId,
          name: d.name,
          specializationId: d.specializationId,
          experienceYears: d.experienceYears,
          contact: d.contact
        });
        this.loading = false;
      },
      error: _ => { this.loading = false; this.snack.open('Failed to load doctor', 'OK', { duration: 3000 }); }
    });
  }

  save() {
    if (this.form.invalid) { this.snack.open('Fill required fields', 'OK', { duration: 2500 }); return; }

    this.loading = true;

    if (!this.id) {
      const payload: CreateDoctorRequest = this.form.value as any;
      this.svc.create(payload).subscribe({
        next: _ => { this.loading = false; this.snack.open('Doctor created','OK',{duration:2000}); this.router.navigate(['/doctors']); },
        error: err => { this.loading = false; this.snack.open(err?.error?.detail || 'Create failed', 'OK', { duration: 3000 }); }
      });
    } else {
      const payload: UpdateDoctorRequest = {
        name: this.form.value.name!,
        specializationId: this.form.value.specializationId!,
        experienceYears: this.form.value.experienceYears!,
        contact: this.form.value.contact!
      };
      this.svc.update(this.id, payload).subscribe({
        next: _ => { this.loading = false; this.snack.open('Doctor updated','OK',{duration:2000}); this.router.navigate(['/doctors']); },
        error: err => { this.loading = false; this.snack.open(err?.error?.detail || 'Update failed', 'OK', { duration: 3000 }); }
      });
    }
  }

  cancel() {
    this.router.navigate(['/doctors']);
  }
}