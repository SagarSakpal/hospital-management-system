import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MedicalRecordsService } from './medical-records.service';
import {
  MedicalRecordDto,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  ArchiveMedicalRecordRequest
} from '../../shared/models/medical-record.model';
import { firstValueFrom } from 'rxjs';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/medical-records';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MedicalRecordsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(MedicalRecordsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('create', () => {
    it('should create a new medical record', async () => {
      const createRequest: CreateMedicalRecordRequest = {
        patientId: 1,
        doctorId: 2,
        recordType: 'Diagnosis',
        description: 'Hypertension - Medication prescribed - Follow-up in 2 weeks'
      };

      const mockResponse: MedicalRecordDto = {
        id: 1,
        patientId: 1,
        doctorId: 2,
        recordType: 'Diagnosis',
        description: 'Hypertension - Medication prescribed - Follow-up in 2 weeks',
        createdOn: '2026-02-25T10:00:00',
        updatedOn: '2026-02-25T10:00:00',
        isArchived: false,
        isDeleted: false,
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        attachmentUrl: null
      };

      const promise = firstValueFrom(service.create(createRequest));

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);

      const record = await promise;
      expect(record).toEqual(mockResponse);
      expect(record.id).toBe(1);
      expect(record.recordType).toBe('Diagnosis');
    });

    it('should handle validation errors', async () => {
      const invalidRequest: any = {
        patientId: null,
        recordType: '',
        description: ''
      };

      const promise = firstValueFrom(service.create(invalidRequest));

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('get', () => {
    it('should retrieve a specific medical record by id', async () => {
      const mockRecord: MedicalRecordDto = {
        id: 1,
        patientId: 1,
        doctorId: 2,
        recordType: 'Diagnosis',
        description: 'Diabetes Type 2 - Insulin therapy - Monitor blood sugar levels',
        createdOn: '2026-02-20T10:00:00',
        updatedOn: '2026-02-20T10:00:00',
        isArchived: false,
        isDeleted: false,
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        attachmentUrl: null
      };

      const promise = firstValueFrom(service.get(1));

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecord);

      const record = await promise;
      expect(record).toEqual(mockRecord);
      expect(record.recordType).toBe('Diagnosis');
    });

    it('should handle 404 when record not found', async () => {
      const promise = firstValueFrom(service.get(999));

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('update', () => {
    it('should update an existing medical record', async () => {
      const updateRequest: UpdateMedicalRecordRequest = {
        recordType: 'Follow-up',
        description: 'Hypertension - Controlled - Medication adjusted - Patient responding well'
      };

      const mockResponse: MedicalRecordDto = {
        id: 1,
        patientId: 1,
        doctorId: 2,
        recordType: 'Follow-up',
        description: 'Hypertension - Controlled - Medication adjusted - Patient responding well',
        createdOn: '2026-02-20T10:00:00',
        updatedOn: '2026-02-25T10:00:00',
        isArchived: false,
        isDeleted: false,
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        attachmentUrl: null
      };

      const promise = firstValueFrom(service.update(1, updateRequest));

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);

      const record = await promise;
      expect(record).toEqual(mockResponse);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a medical record', async () => {
      const promise = firstValueFrom(service.softDelete(1));

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });
  });

  describe('listAll', () => {
    it('should list all medical records excluding archived', async () => {
      const mockRecords: MedicalRecordDto[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          description: 'Cold - Rest recommended',
          createdOn: '2026-02-25T10:00:00',
          updatedOn: '2026-02-25T10:00:00',
          isArchived: false,
          isDeleted: false,
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          attachmentUrl: null
        }
      ];

      const promise = firstValueFrom(service.listAll(false));

      const req = httpMock.expectOne(`${baseUrl}?includeArchived=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);

      const records = await promise;
      expect(records).toEqual(mockRecords);
    });

    it('should list all medical records including archived', async () => {
      const mockRecords: MedicalRecordDto[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          description: 'Cold - Rest recommended',
          createdOn: '2026-02-25T10:00:00',
          updatedOn: '2026-02-25T10:00:00',
          isArchived: false,
          isDeleted: false,
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          attachmentUrl: null
        },
        {
          id: 2,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          description: 'Old condition - Treatment completed',
          createdOn: '2026-01-01T10:00:00',
          updatedOn: '2026-01-01T10:00:00',
          isArchived: true,
          isDeleted: false,
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          attachmentUrl: null
        }
      ];

      const promise = firstValueFrom(service.listAll(true));

      const req = httpMock.expectOne(`${baseUrl}?includeArchived=true`);
      req.flush(mockRecords);

      const records = await promise;
      expect(records.length).toBe(2);
    });
  });

  describe('listByPatient', () => {
    it('should list medical records for a specific patient', async () => {
      const mockRecords: MedicalRecordDto[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          description: 'Flu - Antiviral medication - Rest recommended',
          createdOn: '2026-02-25T10:00:00',
          updatedOn: '2026-02-25T10:00:00',
          isArchived: false,
          isDeleted: false,
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          attachmentUrl: null
        }
      ];

      const promise = firstValueFrom(service.listByPatient(1, false));

      const req = httpMock.expectOne(`${baseUrl}/patient/1?includeArchived=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);

      const records = await promise;
      expect(records).toEqual(mockRecords);
      expect(records[0].patientId).toBe(1);
    });
  });

  describe('listByDoctor', () => {
    it('should list medical records for a specific doctor', async () => {
      const mockRecords: MedicalRecordDto[] = [
        {
          id: 1,
          patientId: 1,
          doctorId: 2,
          recordType: 'Diagnosis',
          description: 'Asthma - Inhaler prescribed - Avoid triggers',
          createdOn: '2026-02-25T10:00:00',
          updatedOn: '2026-02-25T10:00:00',
          isArchived: false,
          isDeleted: false,
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          attachmentUrl: null
        }
      ];

      const promise = firstValueFrom(service.listByDoctor(2, false));

      const req = httpMock.expectOne(`${baseUrl}/doctor/2?includeArchived=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);

      const records = await promise;
      expect(records).toEqual(mockRecords);
      expect(records[0].doctorId).toBe(2);
    });
  });

  describe('archive', () => {
    it('should archive a medical record', async () => {
      const archiveRequest: ArchiveMedicalRecordRequest = {
        archive: true,
        reason: 'Treatment completed successfully'
      };

      const promise = firstValueFrom(service.archive(1, archiveRequest));

      const req = httpMock.expectOne(`${baseUrl}/1/archive`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(archiveRequest);
      req.flush(null);

      await promise;
      expect(true).toBe(true);
    });

    it('should handle archiving non-existent record', async () => {
      const archiveRequest: ArchiveMedicalRecordRequest = {
        archive: true,
        reason: 'Test'
      };

      const promise = firstValueFrom(service.archive(999, archiveRequest));

      const req = httpMock.expectOne(`${baseUrl}/999/archive`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('uploadAttachment', () => {
    it('should upload file attachment and return URL', async () => {
      const mockFile = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
      const expectedUrl = '/uploads/records/1/test-file.pdf';

      const promise = firstValueFrom(service.uploadAttachment(1, mockFile));

      const req = httpMock.expectOne(`${baseUrl}/1/attachment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(expectedUrl);

      const url = await promise;
      expect(url).toBe(expectedUrl);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const promise = firstValueFrom(service.uploadAttachment(1, mockFile));

      const req = httpMock.expectOne(`${baseUrl}/1/attachment`);
      req.flush({ message: 'Invalid file' }, { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toMatchObject({ status: 400 });
    });
  });
});
