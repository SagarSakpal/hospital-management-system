import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PatientListComponent } from './list.component';
import { PatientsService, PatientDto } from '../../core/services/patients.service';
import { RelationshipsService } from '../../core/services/relationships.service';
import { AuthService } from '../../core/auth/auth.service';
import { vi } from 'vitest';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let patientsServiceMock: any;
  let relationshipsServiceMock: any;
  let authServiceMock: any;
  let snackBarMock: any;
  let routerMock: any;
  let dialogMock: any;

  const mockPatients: PatientDto[] = [
    {
      id: 1,
      userId: 'user1',
      name: 'John Doe',
      dob: '1990-01-01',
      gender: 'Male',
      contact: '123-456-7890',
      condition: 'Healthy'
    },
    {
      id: 2,
      userId: 'user2',
      name: 'Jane Smith',
      dob: '1985-05-15',
      gender: 'Female',
      contact: '098-765-4321',
      condition: 'Diabetic'
    }
  ];

  beforeEach(async () => {
    patientsServiceMock = {
      list: vi.fn(),
      softDelete: vi.fn()
    };
    relationshipsServiceMock = {
      getDoctorsForPatient: vi.fn()
    };
    authServiceMock = {
      getRole: vi.fn(),
      isLoggedIn: vi.fn()
    };
    snackBarMock = {
      open: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };
    dialogMock = {
      open: vi.fn()
    };

    authServiceMock.getRole.mockReturnValue('Admin');
    authServiceMock.isLoggedIn.mockReturnValue(true);
    patientsServiceMock.list.mockReturnValue(of([]));
    patientsServiceMock.softDelete.mockReturnValue(of(void 0));
    relationshipsServiceMock.getDoctorsForPatient.mockReturnValue(of([]));
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);

    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [
        { provide: PatientsService, useValue: patientsServiceMock },
        { provide: RelationshipsService, useValue: relationshipsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    (component as any).snack = snackBarMock;
    (component as any).dialog = dialogMock;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients on init', async () => {
    patientsServiceMock.list.mockReturnValue(of(mockPatients));
    component.load();
    expect(component.rows).toEqual(mockPatients);
    expect(component.filteredRows).toEqual(mockPatients);
    expect(component.loading).toBe(false);
  });

  it('should handle load errors', async () => {
    const error = { status: 0 };
    patientsServiceMock.list.mockReturnValue(throwError(() => error));
    component.load();
    await fixture.whenStable();
    expect(component.loading).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should filter by patient name', () => {
    component.rows = mockPatients;
    component.searchTerm = 'john';
    component.applyFilter();
    expect(component.filteredRows.length).toBe(1);
    expect(component.filteredRows[0].name).toBe('John Doe');
  });

  it('should return true for canManage with Admin role', () => {
    component.role = 'Admin';
    expect(component.canManage()).toBe(true);
  });

  it('should return false for canManage with Patient role', () => {
    component.role = 'Patient';
    expect(component.canManage()).toBe(false);
  });

  it('should navigate to create new patient', () => {
    component.add();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/patients/new']);
  });

  it('should delete patient when confirmed', async () => {
    relationshipsServiceMock.getDoctorsForPatient.mockReturnValue(of([]));
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    patientsServiceMock.softDelete.mockReturnValue(of(void 0));
    component.rows = [...mockPatients];
    component.filteredRows = [...mockPatients];
    component.remove(1);
    await fixture.whenStable();
    expect(patientsServiceMock.softDelete).toHaveBeenCalledWith(1);
    expect(snackBarMock.open).toHaveBeenCalledWith('Patient deleted', 'OK', { duration: 2000 });
  });
});
