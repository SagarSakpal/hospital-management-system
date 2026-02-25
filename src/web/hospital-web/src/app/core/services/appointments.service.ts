import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Appointment, CreateAppointmentRequest } from '../../shared/models/appointment.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private base = `${environment.apiBaseUrl}/appointments`;
  constructor(private http: HttpClient) {
    console.log('AppointmentsService - API base URL:', this.base);
  }

  create(payload: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.base, payload);
  }

  // List all appointments (Admin, Doctor, Nurse)
  listAll(): Observable<Appointment[]> {
    console.log('AppointmentsService - Calling listAll API:', this.base);
    return this.http.get<Appointment[]>(this.base).pipe(
      tap(data => console.log('AppointmentsService - listAll response:', data))
    );
  }

  // Day-8 (optional) used for one-day doctor list:
  listDoctorDay(doctorId: number, dateISO: string): Observable<Appointment[]> {
    const params = new HttpParams().set('date', dateISO);
    return this.http.get<Appointment[]>(`${this.base}/doctor/${doctorId}`, { params });
  }

  // NEW: range for a doctor - GET /appointments/doctor/{id}?from=YYYY-MM-DD&to=YYYY-MM-DD
  listByDoctorRange(doctorId: number, fromISO: string, toISO: string): Observable<Appointment[]> {
    const params = new HttpParams().set('from', fromISO).set('to', toISO);
    return this.http.get<Appointment[]>(`${this.base}/doctor/${doctorId}`, { params });
  }

  // NEW: range for a patient - GET /appointments/patient/{id}?from=YYYY-MM-DD&to=YYYY-MM-DD
  listByPatientRange(patientId: number, fromISO: string, toISO: string): Observable<Appointment[]> {
    const params = new HttpParams().set('from', fromISO).set('to', toISO);
    return this.http.get<Appointment[]>(`${this.base}/patient/${patientId}`, { params });
  }

  // NEW: update status - PATCH /appointments/{id}/status { status: "Cancelled" | "Completed" }
  updateStatus(appointmentId: number, newStatus: 'Cancelled' | 'Completed'): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.base}/${appointmentId}/status`, { status: newStatus });
  }
}