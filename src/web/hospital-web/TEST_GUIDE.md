# Frontend Unit Testing Guide

## Test Structure

All frontend unit tests use **Vitest** with Angular Testing utilities.

### Key Patterns

#### Service Tests with HttpTestingController

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', async () => {
    const mockData = { id: 1, name: 'Test' };
    const promise = firstValueFrom(service.getData());
    
    const req = httpMock.expectOne('api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
    
    const result = await promise;
    expect(result).toEqual(mockData);
  });
});
```

### Component Tests

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = { method: vi.fn() };
    
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
       { provide: MyService, useValue: serviceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
```

## Coverage Goals

- Services: 80%+
- Components: 70%+
- Overall: 70%+
