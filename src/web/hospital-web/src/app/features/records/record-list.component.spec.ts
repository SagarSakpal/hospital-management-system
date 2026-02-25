import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { MedicalRecordsService } from '../../core/services/medical-records.service';
import { HttpClient } from '@angular/common/http';
import { RecordListComponent } from './record-list.component';

describe('RecordListComponent', () => {
  let component: RecordListComponent;
  let fixture: ComponentFixture<RecordListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordListComponent],
      providers: [
        { provide: MedicalRecordsService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: MatSnackBar, useValue: { open: () => {}, dismiss: () => {} } },
        { provide: AuthService, useValue: { getRole: () => 'Admin', getUserId: () => 1 } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => ({ subscribe: () => {} }) }) } },
        { provide: HttpClient, useValue: { get: () => ({ subscribe: () => {} }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
