import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DoctorDto {
  id: number;
  userId: string;
  name: string;
  specializationId: number;
  experienceYears: number;
  contact: string;
}

export interface CreateDoctorRequest {
  userId: string;
  name: string;
  specializationId: number;
  experienceYears: number;
  contact: string;
}

export interface UpdateDoctorRequest {
  name: string;
  specializationId: number;
  experienceYears: number;
  contact: string;
}

export interface PatchDoctorRequest {
  name?: string;
  specializationId?: number;
  experienceYears?: number;
  contact?: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private base = `${environment.apiBaseUrl}/doctors`;
  constructor(private http: HttpClient) {}

  list(): Observable<DoctorDto[]> { return this.http.get<DoctorDto[]>(this.base); }
  get(id: number): Observable<DoctorDto> { return this.http.get<DoctorDto>(`${this.base}/${id}`); }

  create(payload: CreateDoctorRequest): Observable<DoctorDto> {
    return this.http.post<DoctorDto>(this.base, payload);
  }
  update(id: number, payload: UpdateDoctorRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }
  patch(id: number, payload: PatchDoctorRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}`, payload);
  }
  softDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}