import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PatientsService, PatientDto, CreatePatientRequest, UpdatePatientRequest } from './patients.service';
import { firstValueFrom } from 'rxjs';

describe('PatientsService', () => {
  let service: PatientsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/patients';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PatientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should retrieve all patients', async () => {
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
          condition: 'Diabetes'
        }
      ];

      const promise = firstValueFrom(service.list());
      
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);

      const patients = await promise;
      expect(patients).toEqual(mockPatients);
      expect(patients.length).toBe(2);
    });

    it('should return empty array when no patients exist', async () => {
      const promise = firstValueFrom(service.list());
      
      const req = httpMock.expectOne(baseUrl);
      req.flush([]);

      const patients = await promise;
      expect(patients).toEqual([]);
      expect(patients.length).toBe(0);
    });
  });

  describe('get', () => {
    it('should retrieve a specific patient by id', async () => {
      const mockPatient: PatientDto = {
        id: 1,
        userId: 'user1',
        name: 'John Doe',
        dob: '1990-01-01',
        gender: 'Male',
        contact: '123-456-7890',
        condition: 'Healthy'
      };

      const promise = firstValueFrom(service.get(1));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatient);

      const patient = await promise;
      expect(patient).toEqual(mockPatient);
      expect(patient.name).toBe('John Doe');
    });

    it('should handle 404 error when patient not found', async () => {
      const promise = firstValueFrom(service.get(999));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createRequest: CreatePatientRequest = {
        userId: 'user3',
        name: 'Bob Johnson',
        dob: '1995-03-20',
        gender: 'Male',
        contact: '555-123-4567',
        condition: 'Asthma'
      };

      const mockResponse: PatientDto = {
        id: 3,
        ...createRequest
      };

      const promise = firstValueFrom(service.create(createRequest));
      
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);

      const patient = await promise;
      expect(patient).toEqual(mockResponse);
      expect(patient.id).toBe(3);
      expect(patient.name).toBe('Bob Johnson');
    });

    it('should handle validation errors', async () => {
      const invalidRequest: CreatePatientRequest = {
        userId: '',
        name: '',
        dob: 'invalid-date',
        gender: 'Unknown',
        contact: '',
        condition: ''
      };

      const promise = firstValueFrom(service.create(invalidRequest));

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('update', () => {
    it('should update an existing patient', async () => {
      const updateRequest: UpdatePatientRequest = {
        name: 'John Doe Updated',
        dob: '1990-01-01',
        gender: 'Male',
        contact: '111-222-3333',
        condition: 'Recovered'
      };

      const promise = firstValueFrom(service.update(1, updateRequest));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });

    it('should handle update of non-existent patient', async () => {
      const updateRequest: UpdatePatientRequest = {
        name: 'Non Existent',
        dob: '2000-01-01',
        gender: 'Male',
        contact: '000-000-0000',
        condition: 'N/A'
      };

      const promise = firstValueFrom(service.update(999, updateRequest));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a patient', async () => {
      const promise = firstValueFrom(service.softDelete(1));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });

    it('should handle deletion of non-existent patient', async () => {
      const promise = firstValueFrom(service.softDelete(999));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });
});
