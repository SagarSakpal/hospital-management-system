import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DoctorsService } from '../../core/services/doctors.service';
import { PatientsService } from '../../core/services/patients.service';
import { RelationshipsService } from '../../core/services/relationships.service';
import { AuthService } from '../../core/auth/auth.service';

import { ManageRelationshipsComponent } from './manage.component';

describe('ManageRelationshipsComponent', () => {
  let component: ManageRelationshipsComponent;
  let fixture: ComponentFixture<ManageRelationshipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRelationshipsComponent],
      providers: [
        { provide: DoctorsService, useValue: { list: () => of([]) } },
        { provide: PatientsService, useValue: { list: () => of([]) } },
        { provide: RelationshipsService, useValue: { getPatientsForDoctor: () => of([]), getDoctorsForPatient: () => of([]), assign: () => of({}), unassign: () => of({}) } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: AuthService, useValue: { getRole: () => 'Admin' } },
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRelationshipsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
