import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DoctorsService, DoctorDto, CreateDoctorRequest, UpdateDoctorRequest, PatchDoctorRequest } from './doctors.service';
import { firstValueFrom } from 'rxjs';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/doctors';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DoctorsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DoctorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should retrieve all doctors', async () => {
      const mockDoctors: DoctorDto[] = [
        {
          id: 1,
          userId: 'doc1',
          name: 'Dr. Smith',
          specializationId: 1,
          experienceYears: 10,
          contact: '123-456-7890'
        },
        {
          id: 2,
          userId: 'doc2',
          name: 'Dr. Johnson',
          specializationId: 2,
          experienceYears: 15,
          contact: '098-765-4321'
        }
      ];

      const promise = firstValueFrom(service.list());
      
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);

      const doctors = await promise;
      expect(doctors).toEqual(mockDoctors);
      expect(doctors.length).toBe(2);
    });

    it('should return empty array when no doctors exist', async () => {
      const promise = firstValueFrom(service.list());
      
      const req = httpMock.expectOne(baseUrl);
      req.flush([]);

      const doctors = await promise;
      expect(doctors).toEqual([]);
    });
  });

  describe('get', () => {
    it('should retrieve a specific doctor by id', async () => {
      const mockDoctor: DoctorDto = {
        id: 1,
        userId: 'doc1',
        name: 'Dr. Smith',
        specializationId: 1,
        experienceYears: 10,
        contact: '123-456-7890'
      };

      const promise = firstValueFrom(service.get(1));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctor);

      const doctor = await promise;
      expect(doctor).toEqual(mockDoctor);
      expect(doctor.name).toBe('Dr. Smith');
    });

    it('should handle 404 error when doctor not found', async () => {
      const promise = firstValueFrom(service.get(999));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('create', () => {
    it('should create a new doctor', async () => {
      const createRequest: CreateDoctorRequest = {
        userId: 'doc3',
        name: 'Dr. Williams',
        specializationId: 3,
        experienceYears: 8,
        contact: '555-123-4567'
      };

      const mockResponse: DoctorDto = {
        id: 3,
        ...createRequest
      };

      const promise = firstValueFrom(service.create(createRequest));
      
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);

      const doctor = await promise;
      expect(doctor).toEqual(mockResponse);
      expect(doctor.id).toBe(3);
    });

    it('should handle duplicate userId error', async () => {
      const duplicateRequest: CreateDoctorRequest = {
        userId: 'existing-user',
        name: 'Dr. Duplicate',
        specializationId: 1,
        experienceYears: 5,
        contact: '111-222-3333'
      };

      const promise = firstValueFrom(service.create(duplicateRequest));

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'UserId already exists' }, { status: 409, statusText: 'Conflict' });

      await expect(promise).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('update', () => {
    it('should update an existing doctor', async () => {
      const updateRequest: UpdateDoctorRequest = {
        name: 'Dr. Smith Updated',
        specializationId: 2,
        experienceYears: 12,
        contact: '111-222-3333'
      };

      const promise = firstValueFrom(service.update(1, updateRequest));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });
  });

  describe('patch', () => {
    it('should partially update a doctor with only name', async () => {
      const patchRequest: PatchDoctorRequest = {
        name: 'Dr. Smith Patched'
      };

      const promise = firstValueFrom(service.patch(1, patchRequest));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(patchRequest);
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });

    it('should partially update a doctor with multiple fields', async () => {
      const patchRequest: PatchDoctorRequest = {
        contact: '999-888-7777',
        experienceYears: 11
      };

      const promise = firstValueFrom(service.patch(1, patchRequest));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(patchRequest);
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });

    it('should handle patch of non-existent doctor', async () => {
      const patchRequest: PatchDoctorRequest = {
        name: 'Non Existent'
      };

      const promise = firstValueFrom(service.patch(999, patchRequest));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a doctor', async () => {
      const promise = firstValueFrom(service.softDelete(1));
      
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });

    it('should handle deletion of non-existent doctor', async () => {
      const promise = firstValueFrom(service.softDelete(999));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });
});
