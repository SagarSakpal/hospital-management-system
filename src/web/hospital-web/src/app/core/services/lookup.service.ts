import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, timer } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

export interface SpecializationDto { id: number; name: string; }
export interface DoctorLiteDto { id: number; name: string; specializationId: number; }

@Injectable({ providedIn: 'root' })
export class LookupService {
  private base = `${environment.apiBaseUrl}/lookups`;

  // simple time-based cache using shareReplay + timer
  private specials$?: Observable<SpecializationDto[]>;
  private doctorsLite$?: Observable<DoctorLiteDto[]>;

  constructor(private http: HttpClient) {}

  specializations(ttlMs = 10 * 60 * 1000): Observable<SpecializationDto[]> {
    if (!this.specials$) {
      this.specials$ = timer(0, ttlMs).pipe(
        switchMap(_ => this.http.get<SpecializationDto[]>(`${this.base}/specializations`)),
        shareReplay(1)
      );
    }
    return this.specials$;
  }

  doctorsLite(ttlMs = 5 * 60 * 1000): Observable<DoctorLiteDto[]> {
    if (!this.doctorsLite$) {
      this.doctorsLite$ = timer(0, ttlMs).pipe(
        switchMap(_ => this.http.get<DoctorLiteDto[]>(`${this.base}/doctors-lite`)),
        shareReplay(1)
      );
    }
    return this.doctorsLite$;
  }
}