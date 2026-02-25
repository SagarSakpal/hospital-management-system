import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LookupService, SpecializationDto, DoctorLiteDto } from './lookup.service';

describe('LookupService', () => {
  let service: LookupService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5012/api/v1/lookups';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LookupService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(LookupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('specializations', () => {
    it('should retrieve list of specializations', () => {
      return new Promise<void>((resolve) => {
        const mockSpecializations: SpecializationDto[] = [
          { id: 1, name: 'Cardiology' },
          { id: 2, name: 'Pediatrics' },
          { id: 3, name: 'Orthopedics' }
        ];

        service.specializations().subscribe(specializations => {
          expect(specializations).toEqual(mockSpecializations);
          expect(specializations.length).toBe(3);
          expect(specializations[0].name).toBe('Cardiology');
          resolve();
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/specializations`);
          expect(req.request.method).toBe('GET');
          req.flush(mockSpecializations);
        }, 10);
      });
    });

    it('should return empty array when no specializations exist', () => {
      return new Promise<void>((resolve) => {
        service.specializations().subscribe(specializations => {
          expect(specializations).toEqual([]);
          resolve();
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/specializations`);
          req.flush([]);
        }, 10);
      });
    });

    it('should cache specializations (second call uses cache)', () => {
      return new Promise<void>((resolve) => {
        const mockSpecializations: SpecializationDto[] = [
          { id: 1, name: 'Cardiology' }
        ];

        let firstCallComplete = false;

        // First subscription
        service.specializations().subscribe(specializations1 => {
          expect(specializations1).toEqual(mockSpecializations);
          firstCallComplete = true;
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/specializations`);
          req.flush(mockSpecializations);

          setTimeout(() => {
            // Second subscription should use cached value (no new HTTP request)
            service.specializations().subscribe(specializations2 => {
              expect(specializations2).toEqual(mockSpecializations);
              expect(firstCallComplete).toBe(true);
              // Verify no additional HTTP requests were made
              httpMock.expectNone(`${baseUrl}/specializations`);
              resolve();
            });
          }, 10);
        }, 10);
      });
    });
  });

  describe('doctorsLite', () => {
    it('should retrieve list of doctors in lite format', () => {
      return new Promise<void>((resolve) => {
        const mockDoctors: DoctorLiteDto[] = [
          { id: 1, name: 'Dr. Smith', specializationId: 1 },
          { id: 2, name: 'Dr. Johnson', specializationId: 2 },
          { id: 3, name: 'Dr. Williams', specializationId: 1 }
        ];

        service.doctorsLite().subscribe(doctors => {
          expect(doctors).toEqual(mockDoctors);
          expect(doctors.length).toBe(3);
          expect(doctors[0].name).toBe('Dr. Smith');
          resolve();
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/doctors-lite`);
          expect(req.request.method).toBe('GET');
          req.flush(mockDoctors);
        }, 10);
      });
    });

    it('should return empty array when no doctors exist', () => {
      return new Promise<void>((resolve) => {
        service.doctorsLite().subscribe(doctors => {
          expect(doctors).toEqual([]);
          resolve();
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/doctors-lite`);
          req.flush([]);
        }, 10);
      });
    });

    it('should cache doctors lite (second call uses cache)', () => {
      return new Promise<void>((resolve) => {
        const mockDoctors: DoctorLiteDto[] = [
          { id: 1, name: 'Dr. Smith', specializationId: 1 }
        ];

        let firstCallComplete = false;

        // First subscription
        service.doctorsLite().subscribe(doctors1 => {
          expect(doctors1).toEqual(mockDoctors);
          firstCallComplete = true;
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/doctors-lite`);
          req.flush(mockDoctors);

          setTimeout(() => {
            // Second subscription should use cached value
            service.doctorsLite().subscribe(doctors2 => {
              expect(doctors2).toEqual(mockDoctors);
              expect(firstCallComplete).toBe(true);
              // Verify no additional HTTP requests
              httpMock.expectNone(`${baseUrl}/doctors-lite`);
              resolve();
            });
          }, 10);
        }, 10);
      });
    });

    it('should filter doctors by specialization', () => {
      return new Promise<void>((resolve) => {
        const mockDoctors: DoctorLiteDto[] = [
          { id: 1, name: 'Dr. Smith', specializationId: 1 },
          { id: 2, name: 'Dr. Johnson', specializationId: 2 }
        ];

        service.doctorsLite().subscribe(doctors => {
          const cardiologists = doctors.filter(d => d.specializationId === 1);
          expect(cardiologists.length).toBe(1);
          expect(cardiologists[0].name).toBe('Dr. Smith');
          resolve();
        });

        setTimeout(() => {
          const req = httpMock.expectOne(`${baseUrl}/doctors-lite`);
          req.flush(mockDoctors);
        }, 10);
      });
    });
  });
});
