import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  MedicalRecordDto,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  ArchiveMedicalRecordRequest
} from '../../shared/models/medical-record.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicalRecordsService {
  private base = `${environment.apiBaseUrl}/medical-records`;

  constructor(private http: HttpClient) {}

  create(payload: CreateMedicalRecordRequest): Observable<MedicalRecordDto> {
    return this.http.post<MedicalRecordDto>(this.base, payload);
  }

  get(id: number): Observable<MedicalRecordDto> {
    return this.http.get<MedicalRecordDto>(`${this.base}/${id}`);
  }

  update(id: number, payload: UpdateMedicalRecordRequest): Observable<MedicalRecordDto> {
    return this.http.put<MedicalRecordDto>(`${this.base}/${id}`, payload);
  }

  softDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  listAll(includeArchived = false): Observable<MedicalRecordDto[]> {
    const params = new HttpParams().set('includeArchived', String(includeArchived));
    return this.http.get<MedicalRecordDto[]>(this.base, { params });
  }

  listByPatient(patientId: number, includeArchived = false): Observable<MedicalRecordDto[]> {
    const params = new HttpParams().set('includeArchived', String(includeArchived));
    return this.http.get<MedicalRecordDto[]>(`${this.base}/patient/${patientId}`, { params });
  }

  listByDoctor(doctorId: number, includeArchived = false): Observable<MedicalRecordDto[]> {
    const params = new HttpParams().set('includeArchived', String(includeArchived));
    return this.http.get<MedicalRecordDto[]>(`${this.base}/doctor/${doctorId}`, { params });
  }

  archive(id: number, req: ArchiveMedicalRecordRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/archive`, req);
  }

  /** Returns the public URL (string) */
  uploadAttachment(id: number, file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<string>(`${this.base}/${id}/attachment`, form);
  }
}