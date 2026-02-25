import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SearchService, RecordSearch } from '../../core/services/search.service';

@Component({
  selector: 'app-records-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './records-search.component.html',
  styleUrls: ['./records-search.component.scss']
})
export class RecordsSearchComponent implements OnInit {
  results: RecordSearch[] = [];
  loading = false;
  form!: FormGroup;

  displayedColumns = ['id','patientId','doctorId','recordType','isArchived','createdOn'];

  constructor(
    private fb: FormBuilder,
    private search: SearchService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      patientId: [null as number | null],
      doctorId: [null as number | null],
      includeArchived: [false]
    });
  }

  doSearch() {
    const { patientId, doctorId, includeArchived } = this.form.value;
    this.loading = true;
    this.search.searchRecords(
      patientId ?? undefined,
      doctorId ?? undefined,
      includeArchived ?? false
    ).subscribe({
      next: res => { this.results = res; this.loading = false; },
      error: _ => { this.loading = false; this.snack.open('Failed to search records','OK',{duration:3000}); }
    });
  }
}