import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DoctorSearch {
  id: number;
  name: string;
  specializationId: number;
  experienceYears: number;
  contact: string;
}

export interface PatientSearch {
  id: number;
  name: string;
  condition: string;
  gender: string;
  contact: string;
}

export interface RecordSearch {
  id: number;
  patientId: number;
  doctorId: number;
  recordType: string;
  isArchived: boolean;
  createdOn: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private base = `${environment.apiBaseUrl}/search`;

  constructor(private http: HttpClient) {}

  searchDoctors(name?: string, specializationId?: number): Observable<DoctorSearch[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (specializationId != null) params = params.set('specializationId', specializationId);
    return this.http.get<DoctorSearch[]>(`${this.base}/doctors`, { params });
  }

  searchPatients(name?: string, condition?: string): Observable<PatientSearch[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (condition) params = params.set('condition', condition);
    return this.http.get<PatientSearch[]>(`${this.base}/patients`, { params });
  }

  searchRecords(patientId?: number, doctorId?: number, includeArchived = false): Observable<RecordSearch[]> {
    let params = new HttpParams().set('includeArchived', includeArchived);
    if (patientId != null) params = params.set('patientId', patientId);
    if (doctorId != null) params = params.set('doctorId', doctorId);
    return this.http.get<RecordSearch[]>(`${this.base}/records`, { params });
  }
}