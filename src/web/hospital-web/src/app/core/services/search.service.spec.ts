import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchService, DoctorSearch, PatientSearch, RecordSearch } from './search.service';
import { firstValueFrom } from 'rxjs';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/search';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('searchDoctors', () => {
    it('should search doctors by name only', async () => {
      const mockDoctors: DoctorSearch[] = [
        {
          id: 1,
          name: 'Dr. Smith',
          specializationId: 1,
          experienceYears: 10,
          contact: '123-456-7890'
        },
        {
          id: 2,
          name: 'Dr. Smithson',
          specializationId: 2,
          experienceYears: 8,
          contact: '098-765-4321'
        }
      ];

      const promise = firstValueFrom(service.searchDoctors('Smith'));

      const req = httpMock.expectOne(`${baseUrl}/doctors?name=Smith`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);

      const doctors = await promise;
      expect(doctors).toEqual(mockDoctors);
      expect(doctors.length).toBe(2);
    });

    it('should search doctors by specializationId only', async () => {
      const mockDoctors: DoctorSearch[] = [
        {
          id: 1,
          name: 'Dr. Cardiologist',
          specializationId: 1,
          experienceYears: 12,
          contact: '111-222-3333'
        }
      ];

      const promise = firstValueFrom(service.searchDoctors(undefined, 1));

      const req = httpMock.expectOne(`${baseUrl}/doctors?specializationId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);

      const doctors = await promise;
      expect(doctors).toEqual(mockDoctors);
      expect(doctors[0].specializationId).toBe(1);
    });

    it('should search doctors by name and specializationId', async () => {
      const mockDoctors: DoctorSearch[] = [
        {
          id: 1,
          name: 'Dr. Smith',
          specializationId: 1,
          experienceYears: 10,
          contact: '123-456-7890'
        }
      ];

      const promise = firstValueFrom(service.searchDoctors('Smith', 1));

      const req = httpMock.expectOne(`${baseUrl}/doctors?name=Smith&specializationId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);

      const doctors = await promise;
      expect(doctors).toEqual(mockDoctors);
      expect(doctors[0].name).toBe('Dr. Smith');
      expect(doctors[0].specializationId).toBe(1);
    });

    it('should return empty array when no doctors match', async () => {
      const promise = firstValueFrom(service.searchDoctors('NonExistent'));

      const req = httpMock.expectOne(`${baseUrl}/doctors?name=NonExistent`);
      req.flush([]);

      const doctors = await promise;
      expect(doctors).toEqual([]);
    });

    it('should search without any params', async () => {
      const mockDoctors: DoctorSearch[] = [
        {
          id: 1,
          name: 'Dr. Smith',
          specializationId: 1,
          experienceYears: 10,
          contact: '123-456-7890'
        }
      ];

      const promise = firstValueFrom(service.searchDoctors());

      const req = httpMock.expectOne(`${baseUrl}/doctors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);

      const doctors = await promise;
      expect(doctors).toEqual(mockDoctors);
    });
  });

  describe('searchPatients', () => {
    it('should search patients by name only', async () => {
      const mockPatients: PatientSearch[] = [
        {
          id: 1,
          name: 'John Doe',
          condition: 'Diabetes',
          gender: 'Male',
          contact: '123-456-7890'
        },
        {
          id: 2,
          name: 'Johnny Smith',
          condition: 'Healthy',
          gender: 'Male',
          contact: '098-765-4321'
        }
      ];

      const promise = firstValueFrom(service.searchPatients('John'));

      const req = httpMock.expectOne(`${baseUrl}/patients?name=John`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);

      const patients = await promise;
      expect(patients).toEqual(mockPatients);
      expect(patients.length).toBe(2);
    });

    it('should search patients by condition only', async () => {
      const mockPatients: PatientSearch[] = [
        {
          id: 1,
          name: 'John Doe',
          condition: 'Diabetes',
          gender: 'Male',
          contact: '123-456-7890'
        },
        {
          id: 2,
          name: 'Jane Smith',
          condition: 'Diabetes',
          gender: 'Female',
          contact: '555-123-4567'
        }
      ];

      const promise = firstValueFrom(service.searchPatients(undefined, 'Diabetes'));

      const req = httpMock.expectOne(`${baseUrl}/patients?condition=Diabetes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);

      const patients = await promise;
      expect(patients).toEqual(mockPatients);
      expect(patients.every(p => p.condition === 'Diabetes')).toBe(true);
    });

    it('should search patients by name and condition', async () => {
      const mockPatients: PatientSearch[] = [
        {
          id: 1,
          name: 'John Doe',
          condition: 'Diabetes',
          gender: 'Male',
          contact: '123-456-7890'
        }
      ];

      const promise = firstValueFrom(service.searchPatients('John', 'Diabetes'));

      const req = httpMock.expectOne(`${baseUrl}/patients?name=John&condition=Diabetes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);

      const patients = await promise;
      expect(patients).toEqual(mockPatients);
      expect(patients[0].name).toBe('John Doe');
      expect(patients[0].condition).toBe('Diabetes');
    });

    it('should return empty array when no patients match', async () => {
      const promise = firstValueFrom(service.searchPatients('NonExistent'));

      const req = httpMock.expectOne(`${baseUrl}/patients?name=NonExistent`);
      req.flush([]);

      const patients = await promise;
      expect(patients).toEqual([]);
    });

    it('should search without any params', async () => {
      const mockPatients: PatientSearch[] = [
        {
          id: 1,
          name: 'John Doe',
          condition: 'Healthy',
          gender: 'Male',
          contact: '123-456-7890'
        }
      ];

      const promise = firstValueFrom(service.searchPatients());

      const req = httpMock.expectOne(`${baseUrl}/patients`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);

      const patients = await promise;
      expect(patients).toEqual(mockPatients);
    });
  });

  describe('searchRecords', () => {
    it('should search medical records by patientId', async () => {
      const mockRecords: RecordSearch[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          isArchived: false,
          createdOn: '2026-02-25T10:00:00'
        }
      ];

      const promise = firstValueFrom(service.searchRecords(1));

        const req = httpMock.expectOne(`${baseUrl}/records?includeArchived=false&patientId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);

      const records = await promise;
      expect(records).toEqual(mockRecords);
    });

    it('should search medical records by doctorId', async () => {
      const mockRecords: RecordSearch[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          isArchived: false,
          createdOn: '2026-02-25T10:00:00'
        }
      ];

      const promise = firstValueFrom(service.searchRecords(undefined, 2));

        const req = httpMock.expectOne(`${baseUrl}/records?includeArchived=false&doctorId=2`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);

      const records = await promise;
      expect(records).toEqual(mockRecords);
      expect(records[0].doctorId).toBe(2);
    });

    it('should exclude archived records by default', async () => {
      const mockRecords: RecordSearch[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          isArchived: false,
          createdOn: '2026-02-25T10:00:00'
        }
      ];

      const promise = firstValueFrom(service.searchRecords(1, undefined, false));

        const req = httpMock.expectOne(`${baseUrl}/records?includeArchived=false&patientId=1`);
      req.flush(mockRecords);

      const records = await promise;
      expect(records).toEqual(mockRecords);
    });

    it('should include archived records when requested', async () => {
      const mockRecords: RecordSearch[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          isArchived: false,
          createdOn: '2026-02-25T10:00:00'
        },
        {
          id: 2,
          patientId: 1,
          doctorId: 2,
          recordType: 'Old Record',
          isArchived: true,
          createdOn: '2025-01-01T10:00:00'
        }
      ];

      const promise = firstValueFrom(service.searchRecords(1, undefined, true));

        const req = httpMock.expectOne(`${baseUrl}/records?includeArchived=true&patientId=1`);
      req.flush(mockRecords);

      const records = await promise;
      expect(records.length).toBe(2);
      expect(records.some(r => r.isArchived)).toBe(true);
    });
  });
});
