import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppointmentsService } from './appointments.service';
import { Appointment, CreateAppointmentRequest } from '../../shared/models/appointment.model';
import { firstValueFrom } from 'rxjs';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/appointments';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppointmentsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AppointmentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('create', () => {
    it('should create a new appointment', async () => {
      const createRequest: CreateAppointmentRequest = {
        doctorId: 1,
        patientId: 2,
        startTime: '2026-03-01T10:00:00',
        notes: 'Regular checkup'
      };

      const mockResponse: Appointment = {
        id: 1,
        doctorId: 1,
        patientId: 2,
        startTime: '2026-03-01T10:00:00',
        endTime: '2026-03-01T11:00:00',
        notes: 'Regular checkup',
        status: 'Scheduled',
        doctorName: 'Dr. Smith',
        patientName: 'John Doe'
      };

      const promise = firstValueFrom(service.create(createRequest));
      
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);

      const appointment = await promise;
      expect(appointment).toEqual(mockResponse);
      expect(appointment.id).toBe(1);
      expect(appointment.status).toBe('Scheduled');
    });

    it('should handle time conflict error', async () => {
      const conflictRequest: CreateAppointmentRequest = {
        doctorId: 1,
        patientId: 2,
        startTime: '2026-03-01T10:00:00',
        notes: 'Conflicting appointment'
      };

      const promise = firstValueFrom(service.create(conflictRequest));

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Time slot conflict' }, { status: 409, statusText: 'Conflict' });

      await expect(promise).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('listAll', () => {
    it('should retrieve all appointments', async () => {
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          doctorId: 1,
          patientId: 2,
          startTime: '2026-03-01T10:00:00',
          endTime: '2026-03-01T11:00:00',
          notes: 'Checkup',
          status: 'Scheduled',
          doctorName: 'Dr. Smith',
          patientName: 'John Doe'
        },
        {
          id: 2,
          doctorId: 2,
          patientId: 3,
          startTime: '2026-03-02T14:00:00',
          endTime: '2026-03-02T15:00:00',
          notes: 'Follow-up',
          status: 'Completed',
          doctorName: 'Dr. Johnson',
          patientName: 'Jane Smith'
        }
      ];

      const promise = firstValueFrom(service.listAll());

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);

      const appointments = await promise;
      expect(appointments).toEqual(mockAppointments);
      expect(appointments.length).toBe(2);
    });

    it('should return empty array when no appointments exist', async () => {
      const promise = firstValueFrom(service.listAll());

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);

      const appointments = await promise;
      expect(appointments).toEqual([]);
    });
  });

  describe('listDoctorDay', () => {
    it('should retrieve appointments for a doctor on a specific day', async () => {
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          doctorId: 1,
          patientId: 2,
          startTime: '2026-03-01T10:00:00',
          endTime: '2026-03-01T11:00:00',
          notes: 'Morning appointment',
          status: 'Scheduled',
          doctorName: 'Dr. Smith',
          patientName: 'John Doe'
        }
      ];

      const promise = firstValueFrom(service.listDoctorDay(1, '2026-03-01'));

      const req = httpMock.expectOne(`${baseUrl}/doctor/1?date=2026-03-01`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);

      const appointments = await promise;
      expect(appointments).toEqual(mockAppointments);
      expect(appointments.length).toBe(1);
    });
  });

  describe('listByDoctorRange', () => {
    it('should retrieve appointments for a doctor within date range', async () => {
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          doctorId: 1,
          patientId: 2,
          startTime: '2026-03-01T10:00:00',
          endTime: '2026-03-01T11:00:00',
          notes: 'Day 1',
          status: 'Scheduled',
          doctorName: 'Dr. Smith',
          patientName: 'John Doe'
        },
        {
          id: 2,
          doctorId: 1,
          patientId: 3,
          startTime: '2026-03-05T14:00:00',
          endTime: '2026-03-05T15:00:00',
          notes: 'Day 5',
          status: 'Scheduled',
          doctorName: 'Dr. Smith',
          patientName: 'Jane Smith'
        }
      ];

      const promise = firstValueFrom(service.listByDoctorRange(1, '2026-03-01', '2026-03-10'));

      const req = httpMock.expectOne(`${baseUrl}/doctor/1?from=2026-03-01&to=2026-03-10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);

      const appointments = await promise;
      expect(appointments).toEqual(mockAppointments);
      expect(appointments.length).toBe(2);
    });
  });

  describe('listByPatientRange', () => {
    it('should retrieve appointments for a patient within date range', async () => {
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          doctorId: 1,
          patientId: 2,
          startTime: '2026-03-01T10:00:00',
          endTime: '2026-03-01T11:00:00',
          notes: 'Checkup',
          status: 'Completed',
          doctorName: 'Dr. Smith',
          patientName: 'John Doe'
        }
      ];

      const promise = firstValueFrom(service.listByPatientRange(2, '2026-03-01', '2026-03-31'));

      const req = httpMock.expectOne(`${baseUrl}/patient/2?from=2026-03-01&to=2026-03-31`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);

      const appointments = await promise;
      expect(appointments).toEqual(mockAppointments);
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status to Cancelled', async () => {
      const mockUpdated: Appointment = {
        id: 1,
        doctorId: 1,
        patientId: 2,
        startTime: '2026-03-01T10:00:00',
        endTime: '2026-03-01T11:00:00',
        notes: 'Cancelled by patient',
        status: 'Cancelled',
        doctorName: 'Dr. Smith',
        patientName: 'John Doe'
      };

      const promise = firstValueFrom(service.updateStatus(1, 'Cancelled'));

      const req = httpMock.expectOne(`${baseUrl}/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'Cancelled' });
      req.flush(mockUpdated);

      const appointment = await promise;
      expect(appointment.status).toBe('Cancelled');
    });

    it('should update appointment status to Completed', async () => {
      const mockUpdated: Appointment = {
        id: 1,
        doctorId: 1,
        patientId: 2,
        startTime: '2026-03-01T10:00:00',
        endTime: '2026-03-01T11:00:00',
        notes: 'Appointment completed',
        status: 'Completed',
        doctorName: 'Dr. Smith',
        patientName: 'John Doe'
      };

      const promise = firstValueFrom(service.updateStatus(1, 'Completed'));

      const req = httpMock.expectOne(`${baseUrl}/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'Completed' });
      req.flush(mockUpdated);

      const appointment = await promise;
      expect(appointment.status).toBe('Completed');
    });

    it('should handle update of non-existent appointment', async () => {
      const promise = firstValueFrom(service.updateStatus(999, 'Cancelled'));

      const req = httpMock.expectOne(`${baseUrl}/999/status`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });
});
