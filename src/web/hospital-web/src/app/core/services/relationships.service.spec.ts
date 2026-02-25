import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RelationshipsService, DoctorPatientDto, AssignRequest, UnassignRequest } from './relationships.service';
import { firstValueFrom } from 'rxjs';

describe('RelationshipsService', () => {
  let service: RelationshipsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/relationships';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RelationshipsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RelationshipsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('assign', () => {
    it('should assign a patient to a doctor', async () => {
      const assignRequest: AssignRequest = {
        doctorId: 1,
        patientId: 2
      };

      const mockResponse = { success: true, message: 'Patient assigned successfully' };

      const promise = firstValueFrom(service.assign(assignRequest));

      const req = httpMock.expectOne(`${baseUrl}/assign`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(assignRequest);
      req.flush(mockResponse);

      const response = await promise;
      expect(response).toEqual(mockResponse);
    });

    it('should handle duplicate assignment error', async () => {
      const assignRequest: AssignRequest = {
        doctorId: 1,
        patientId: 2
      };

      const promise = firstValueFrom(service.assign(assignRequest));

      const req = httpMock.expectOne(`${baseUrl}/assign`);
      req.flush({ message: 'Relationship already exists' }, { status: 409, statusText: 'Conflict' });

      await expect(promise).rejects.toMatchObject({ status: 409 });
    });

    it('should handle non-existent doctor error', async () => {
      const assignRequest: AssignRequest = {
        doctorId: 999,
        patientId: 2
      };

      const promise = firstValueFrom(service.assign(assignRequest));

      const req = httpMock.expectOne(`${baseUrl}/assign`);
      req.flush({ message: 'Doctor not found' }, { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('unassign', () => {
    it('should unassign a patient from a doctor', async () => {
      const unassignRequest: UnassignRequest = {
        doctorId: 1,
        patientId: 2
      };

      const mockResponse = { success: true, message: 'Patient unassigned successfully' };

      const promise = firstValueFrom(service.unassign(unassignRequest));

      const req = httpMock.expectOne(`${baseUrl}/unassign`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(unassignRequest);
      req.flush(mockResponse);

      const response = await promise;
      expect(response).toEqual(mockResponse);
    });

    it('should handle unassigning non-existent relationship', async () => {
      const unassignRequest: UnassignRequest = {
        doctorId: 1,
        patientId: 999
      };

      const promise = firstValueFrom(service.unassign(unassignRequest));

      const req = httpMock.expectOne(`${baseUrl}/unassign`);
      req.flush({ message: 'Relationship not found' }, { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('getPatientsForDoctor', () => {
    it('should retrieve all patients for a specific doctor', async () => {
      const mockPatients: DoctorPatientDto[] = [
        { id: 1, doctorId: 1, patientId: 2, isActive: true },
        { id: 2, doctorId: 1, patientId: 3, isActive: true },
        { id: 3, doctorId: 1, patientId: 4, isActive: false }
      ];

      const promise = firstValueFrom(service.getPatientsForDoctor(1));

      const req = httpMock.expectOne(`${baseUrl}/doctor/1/patients`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);

      const patients = await promise;
      expect(patients).toEqual(mockPatients);
      expect(patients.length).toBe(3);
      expect(patients[0].doctorId).toBe(1);
    });

    it('should return empty array when doctor has no patients', async () => {
      const promise = firstValueFrom(service.getPatientsForDoctor(99));

      const req = httpMock.expectOne(`${baseUrl}/doctor/99/patients`);
      req.flush([]);

      const patients = await promise;
      expect(patients).toEqual([]);
    });

    it('should filter active patients from result', async () => {
      const mockPatients: DoctorPatientDto[] = [
        { id: 1, doctorId: 1, patientId: 2, isActive: true },
        { id: 2, doctorId: 1, patientId: 3, isActive: false }
      ];

      const promise = firstValueFrom(service.getPatientsForDoctor(1));

      const req = httpMock.expectOne(`${baseUrl}/doctor/1/patients`);
      req.flush(mockPatients);

      const patients = await promise;
      const activePatients = patients.filter(p => p.isActive);
      expect(activePatients.length).toBe(1);
      expect(activePatients[0].patientId).toBe(2);
    });
  });

  describe('getDoctorsForPatient', () => {
    it('should retrieve all doctors for a specific patient', async () => {
      const mockDoctors: DoctorPatientDto[] = [
        { id: 1, doctorId: 1, patientId: 2, isActive: true },
        { id: 2, doctorId: 3, patientId: 2, isActive: true }
      ];

      const promise = firstValueFrom(service.getDoctorsForPatient(2));

      const req = httpMock.expectOne(`${baseUrl}/patient/2/doctors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);

      const doctors = await promise;
      expect(doctors).toEqual(mockDoctors);
      expect(doctors.length).toBe(2);
      expect(doctors[0].patientId).toBe(2);
    });

    it('should return empty array when patient has no assigned doctors', async () => {
      const promise = firstValueFrom(service.getDoctorsForPatient(99));

      const req = httpMock.expectOne(`${baseUrl}/patient/99/doctors`);
      req.flush([]);

      const doctors = await promise;
      expect(doctors).toEqual([]);
    });

    it('should handle patient not found error', async () => {
      const promise = firstValueFrom(service.getDoctorsForPatient(999));

      const req = httpMock.expectOne(`${baseUrl}/patient/999/doctors`);
      req.flush({ message: 'Patient not found' }, { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });
});
