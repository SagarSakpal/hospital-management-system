# Frontend Unit Tests

Comprehensive unit test suite for the Hospital Management System Angular frontend.

## Test Coverage

### Services (9 Services - 100% Coverage)
1. **AuthService** - Authentication and JWT token management
   - Login with credentials
   - Logout functionality
   - Token validation (isLoggedIn)
   - Role extraction from JWT
   - User ID extraction from JWT EntityId claim

2. **TokenStorageService** - LocalStorage token management
   - Save access/refresh tokens and role
   - Retrieve tokens
   - Clear tokens
   - Platform detection (browser/server)

3. **PatientsService** - Patient CRUD operations
   - List all patients
   - Get single patient
   - Create new patient
   - Update patient
   - Soft delete patient

4. **DoctorsService** - Doctor management
   - List all doctors
   - Get single doctor
   - Create new doctor
   - Update doctor (PUT)
   - Partial update (PATCH)
   - Soft delete doctor

5. **AppointmentsService** - Appointment scheduling
   - Create appointment
   - List all appointments
   - List by doctor (day/range)
   - List by patient (range)
   - Update appointment status

6. **MedicalRecordsService** - Medical records management
   - Create record
   - Get record
   - Update record
   - Soft delete record
   - List all/by patient/by doctor
   - Archive record
   - Upload attachment

7. **SearchService** - Search across entities
   - Search doctors (by name, specialization)
   - Search patients (by name, condition)
   - Search records (by patient, doctor, archived)

8. **RelationshipsService** - Doctor-Patient relationships
   - Assign patient to doctor
   - Unassign patient from doctor
   - Get patients for doctor
   - Get doctors for patient

9. **LookupService** - Lookup data with caching
   - Get specializations (cached)
   - Get doctors lite (cached)
   - TTL-based caching

### Components (2 Components - Key Functionality)
1. **LoginComponent** - User authentication
   - Form validation (email, password)
   - Login success scenarios
   - Error handling (401, 403, 404, 500, connection)
   - Role-based navigation
   - Return URL handling

2. **PatientListComponent** - Patient listing and management
   - Load patients
   - Filter/search functionality
   - Role-based permissions (canManage)
   - Delete with relationship validation
   - CRUD navigation

## Test Structure

### Service Tests
Tests use `HttpTestingController` to mock HTTP requests:
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceName, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ServiceName);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should perform action', (done) => {
    service.method().subscribe(result => {
      expect(result).toEqual(expected);
      done();
    });
    const req = httpMock.expectOne(url);
    req.flush(mockData);
  });
});
```

### Component Tests
Tests use Jasmine spies to mock dependencies:
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let serviceMock: jasmine.SpyObj<ServiceName>;

  beforeEach(async () => {
    serviceMock = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);
    
    await TestBed.configureTestingModule({
      imports: [ComponentName],
      providers: [{ provide: ServiceName, useValue: serviceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });

  it('should perform action', fakeAsync(() => {
    serviceMock.method.and.returnValue(of(mockData));
    component.action();
    tick();
    expect(serviceMock.method).toHaveBeenCalled();
  }));
});
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- auth.service.spec.ts
```

## Test Patterns

### AAA Pattern (Arrange-Act-Assert)
All tests follow the AAA pattern:
```typescript
it('should do something', () => {
  // Arrange - Set up test data and mocks
  const input = { ... };
  serviceMock.method.and.returnValue(of(mockData));

  // Act - Execute the code under test
  component.action(input);

  // Assert - Verify the results
  expect(component.result).toBe(expected);
});
```

### Async Testing
- Use `fakeAsync` and `tick()` for time-based async operations
- Use `done()` callback for observable subscriptions
- Use `waitForAsync` for promise-based operations

### Error Testing
Always test error scenarios:
```typescript
it('should handle errors', (done) => {
  const error = { status: 404, error: { message: 'Not found' } };
  service.method().subscribe({
    error: (err) => {
      expect(err.status).toBe(404);
      done();
    }
  });
  const req = httpMock.expectOne(url);
  req.flush(error, { status: 404, statusText: 'Not Found' });
});
```

## Coverage Goals

- **Overall**: >70% (Target: 80%+)
- **Services**: >90%
- **Components**: >70%
- **Models**: N/A (interfaces/types)

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Mock Dependencies**: Always mock external dependencies
4. **Test Edge Cases**: Include success, error, and edge cases
5. **No Production Changes**: Tests don't modify production code
6. **Fast Execution**: Tests should run quickly (< 5 seconds total)

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks
- Pull requests
- Merge to main branch
- Nightly builds

## Troubleshooting

### Test fails with "Cannot resolve all parameters"
- Ensure all dependencies are provided in TestBed
- Check imports in component/service

### Http request not expected
- Verify `httpMock.verify()` in afterEach
- Check URL matches exactly (including query params)

### fakeAsync test hangs
- Ensure all async operations are completed
- Call `tick()` after async operations
- Use `flush()` for all pending timers

### Component not rendering
- Call `fixture.detectChanges()` after setup
- Use `fixture.whenStable()` for async template operations

## Future Enhancements

- Add E2E tests with Playwright/Cypress
- Add visual regression tests
- Increase component test coverage
- Add integration tests for complex flows
- Performance testing for search operations

## Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io)
- [Vitest Documentation](https://vitest.dev)
