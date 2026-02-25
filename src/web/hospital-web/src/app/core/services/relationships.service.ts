import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DoctorPatientDto {
  id: number;
  doctorId: number;
  patientId: number;
  isActive: boolean;
}

export interface AssignRequest { doctorId: number; patientId: number; }
export interface UnassignRequest { doctorId: number; patientId: number; }

@Injectable({ providedIn: 'root' })
export class RelationshipsService {
  private base = `${environment.apiBaseUrl}/relationships`;

  constructor(private http: HttpClient) {}

  assign(payload: AssignRequest): Observable<any> {
    return this.http.post(`${this.base}/assign`, payload);
  }
  unassign(payload: UnassignRequest): Observable<any> {
    return this.http.post(`${this.base}/unassign`, payload);
  }
  getPatientsForDoctor(doctorId: number): Observable<DoctorPatientDto[]> {
    return this.http.get<DoctorPatientDto[]>(`${this.base}/doctor/${doctorId}/patients`);
  }
  getDoctorsForPatient(patientId: number): Observable<DoctorPatientDto[]> {
    return this.http.get<DoctorPatientDto[]>(`${this.base}/patient/${patientId}/doctors`);
  }
}