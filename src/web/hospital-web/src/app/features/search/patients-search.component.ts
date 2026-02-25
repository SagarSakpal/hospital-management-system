import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SearchService, PatientSearch } from '../../core/services/search.service';

@Component({
  selector: 'app-patients-search',
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
  templateUrl: './patients-search.component.html',
  styleUrls: ['./patients-search.component.scss']
})
export class PatientsSearchComponent implements OnInit {
  results: PatientSearch[] = [];
  loading = false;
  form!: FormGroup;

  displayedColumns = ['name','condition','gender','contact'];

  constructor(
    private fb: FormBuilder,
    private search: SearchService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [''],
      condition: ['']
    });
  }

  doSearch() {
    const { name, condition } = this.form.value;
    this.loading = true;
    this.search.searchPatients(name || undefined, condition || undefined).subscribe({
      next: res => { this.results = res; this.loading = false; },
      error: _ => { this.loading = false; this.snack.open('Failed to search patients','OK',{duration:3000}); }
    });
  }
}