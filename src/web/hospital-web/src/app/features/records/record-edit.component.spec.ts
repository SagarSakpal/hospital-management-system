import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import { DoctorsService } from '../../core/services/doctors.service';
import { PatientsService } from '../../core/services/patients.service';
import { MedicalRecordsService } from '../../core/services/medical-records.service';
import { RecordEditComponent } from './record-edit.component';

describe('RecordEditComponent', () => {
  let component: RecordEditComponent;
  let fixture: ComponentFixture<RecordEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordEditComponent],
      providers: [
        { provide: MedicalRecordsService, useValue: {} },
        { provide: DoctorsService, useValue: {} },
        { provide: PatientsService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: AuthService, useValue: { getRole: () => 'Admin' } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
