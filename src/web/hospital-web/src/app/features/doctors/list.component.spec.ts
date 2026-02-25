import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { DoctorsService } from '../../core/services/doctors.service';

import { DoctorListComponent } from './list.component';

describe('DoctorListComponent', () => {
  let component: DoctorListComponent;
  let fixture: ComponentFixture<DoctorListComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorListComponent],
      providers: [
        { provide: DoctorsService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => ({ subscribe: () => {} }) }) } },
        { provide: AuthService, useValue: { getRole: () => 'Admin', isLoggedIn: () => true } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
