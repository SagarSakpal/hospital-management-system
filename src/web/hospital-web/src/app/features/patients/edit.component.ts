import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {
  CreatePatientRequest, PatientsService, UpdatePatientRequest
} from '../../core/services/patients.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-patient-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class PatientEditComponent implements OnInit {
  id: number | null = null;
  loading = false;
  form!: ReturnType<typeof this.createForm>;

  constructor(
    private fb: FormBuilder,
    private svc: PatientsService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      userId: ['', [Validators.required]],
      name: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      contact: ['', [Validators.required]],
      condition: ['', [Validators.required]],
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
        this.form.patchValue(d as any); 
        this.loading = false; 
      },
      error: _ => { 
        this.loading = false; 
        this.snack.open('Failed to load patient', 'OK', { duration: 3000 }); 
      }
    });
  }

  save() {
    if (this.form.invalid) { 
      this.snack.open('Fill required fields', 'OK', { duration: 2500 }); 
      return; 
    }
    this.loading = true;
    if (!this.id) {
      const dobDate = new Date(this.form.value.dob!);
      const dobString = new Date(dobDate.getTime() - dobDate.getTimezoneOffset() * 60000).toISOString();
      const payload: CreatePatientRequest = {
        ...this.form.value,
        dob: dobString
      } as any;
      this.svc.create(payload).subscribe({
        next: _ => { 
          this.loading = false; 
          this.snack.open('Patient created', 'OK', { duration: 2000 }); 
          this.router.navigate(['/patients']); 
        },
        error: err => { 
          this.loading = false; 
          this.snack.open(err?.error?.detail || 'Create failed', 'OK', { duration: 3000 }); 
        }
      });
    } else {
      const dobDate = new Date(this.form.value.dob!);
      const dobString = new Date(dobDate.getTime() - dobDate.getTimezoneOffset() * 60000).toISOString();
      const payload: UpdatePatientRequest = {
        name: this.form.value.name!,
        dob: dobString,
        gender: this.form.value.gender!,
        contact: this.form.value.contact!,
        condition: this.form.value.condition!
      };
      this.svc.update(this.id, payload).subscribe({
        next: _ => { 
          this.loading = false; 
          this.snack.open('Patient updated', 'OK', { duration: 2000 }); 
          this.router.navigate(['/patients']); 
        },
        error: err => { 
          this.loading = false; 
          this.snack.open(err?.error?.detail || 'Update failed', 'OK', { duration: 3000 }); 
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/patients']);
  }
}