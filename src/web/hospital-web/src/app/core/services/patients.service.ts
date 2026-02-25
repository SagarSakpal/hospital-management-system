import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface PatientDto {
  id: number;
  userId: string;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  condition: string;
}

export interface CreatePatientRequest {
  userId: string;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  condition: string;
}

export interface UpdatePatientRequest {
  name: string;
  dob: string;
  gender: string;
  contact: string;
  condition: string;
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private base = `${environment.apiBaseUrl}/patients`;
  constructor(private http: HttpClient) {}

  list(): Observable<PatientDto[]> { return this.http.get<PatientDto[]>(this.base); }
  get(id: number): Observable<PatientDto> { return this.http.get<PatientDto>(`${this.base}/${id}`); }
  create(payload: CreatePatientRequest): Observable<PatientDto> {
    return this.http.post<PatientDto>(this.base, payload);
  }
  update(id: number, payload: UpdatePatientRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }
  softDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}