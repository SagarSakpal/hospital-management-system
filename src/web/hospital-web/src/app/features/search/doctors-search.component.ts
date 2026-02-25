import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SearchService, DoctorSearch } from '../../core/services/search.service';

@Component({
  selector: 'app-doctors-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './doctors-search.component.html',
  styleUrls: ['./doctors-search.component.scss']
})
export class DoctorsSearchComponent implements OnInit {
  results: DoctorSearch[] = [];
  loading = false;
  form!: FormGroup;

  displayedColumns = ['name','experienceYears','contact'];

  constructor(
    private fb: FormBuilder,
    private search: SearchService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [''],
      specializationId: [null as number | null]
    });
  }

  doSearch() {
    const { name, specializationId } = this.form.value;
    this.loading = true;
    this.search.searchDoctors(name || undefined, specializationId ?? undefined).subscribe({
      next: res => { this.results = res; this.loading = false; },
      error: _ => { this.loading = false; this.snack.open('Failed to search doctors','OK',{duration:3000}); }
    });
  }
}