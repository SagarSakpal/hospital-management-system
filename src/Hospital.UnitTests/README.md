# Hospital Management System - Unit Tests

## Overview

This test project contains comprehensive unit tests for the Hospital Management System backend. The tests follow industry best practices and cover services, controllers, and business logic validation.

## Test Framework & Tools

- **xUnit** - Testing framework
- **Moq** - Mocking framework for creating test doubles
- **FluentAssertions** - Provides readable and expressive assertions
- **Coverlet** - Code coverage analysis

## Test Structure

```
Hospital.UnitTests/
├── Services/                    # Service layer tests
│   ├── PatientServiceTests.cs
│   ├── DoctorServiceTests.cs
│   ├── AppointmentServiceTests.cs
│   └── MedicalRecordServiceTests.cs
├── Controllers/                 # Controller layer tests
│   └── MedicalRecordsControllerTests.cs
└── README.md
```

## Test Organization

### Naming Convention

Tests follow the pattern: `MethodName_Scenario_ExpectedBehavior`

Examples:
- `CreateAsync_WithValidRequest_ShouldCreatePatientAndReturnDto`
- `GetAsync_WithNonExistentId_ShouldThrowNotFoundException`
- `UpdateAsync_WithUnauthorizedRole_ShouldThrowBusinessRuleException`

### AAA Pattern

All tests follow the Arrange-Act-Assert pattern:

```csharp
[Fact]
public async Task CreateAsync_WithValidRequest_ShouldCreatePatientSuccessfully()
{
    // Arrange - Set up test data, mocks, and expectations
    var request = new CreatePatientRequest { /* ... */ };
    var patient = new Patient { /* ... */ };
    _mockRepository.Setup(/* ... */);
    
    // Act - Execute the method under test
    var result = await _sut.CreateAsync(request, "actor", CancellationToken.None);
    
    // Assert - Verify the outcome
    result.Should().NotBeNull();
    result.Id.Should().Be(1);
    _mockRepository.Verify(/* ... */, Times.Once);
}
```

## Test Coverage

### Service Tests

#### PatientServiceTests
- ✅ Create patient with valid data
- ✅ List all patients
- ✅ Get patient by ID
- ✅ Get patient with non-existent ID (throws NotFoundException)
- ✅ Update patient with valid data
- ✅ Update patient with non-existent ID (throws exception)
- ✅ Soft delete patient
- ✅ Soft delete non-existent patient (throws exception)

#### AppointmentServiceTests
- ✅ Create appointment with valid data
- ✅ Create appointment with empty actor user ID (throws BusinessRuleException)
- ✅ Create appointment with non-existent doctor
- ✅ Create appointment with non-existent patient
- ✅ Create appointment with time slot conflict
- ✅ Get appointment by ID
- ✅ Get appointment with non-existent ID returns null
- ✅ List all appointments

#### MedicalRecordServiceTests
- ✅ Create record (role-based: Admin/Doctor/Nurse)
- ✅ Create record with unauthorized role
- ✅ Create record with non-existent patient/doctor
- ✅ Update record (role-based authorization)
- ✅ Get record by ID
- ✅ List all records (role-based)
- ✅ Archive/Unarchive record (Admin only)
- ✅ Soft delete record
- ✅ Upload attachment with authorization
- ✅ Upload attachment without authorization

#### DoctorServiceTests
- ✅ Create doctor with valid data
- ✅ Create doctor with duplicate UserId
- ✅ Create doctor with duplicate Contact
- ✅ Get doctor by ID
- ✅ List all doctors
- ✅ Update doctor
- ✅ Update with duplicate contact
- ✅ Patch doctor (partial update)
- ✅ Patch with multiple fields

### Controller Tests

#### MedicalRecordsControllerTests
- ✅ Create record endpoint
- ✅ Get record endpoint
- ✅ List all records endpoint
- ✅ List records by patient
- ✅ Update record endpoint
- ✅ Archive record endpoint
- ✅ Soft delete record endpoint
- ✅ Upload attachment with valid file
- ✅ Upload attachment with null file (returns BadRequest)
- ✅ Upload attachment with empty file (returns BadRequest)
- ✅ Download attachment with valid ID
- ✅ Download attachment when no attachment exists

## Running Tests

### Command Line

```bash
# Run all tests
dotnet test

# Run tests with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run tests with code coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura

# Run specific test class
dotnet test --filter "FullyQualifiedName~PatientServiceTests"

# Run specific test method
dotnet test --filter "FullyQualifiedName~PatientServiceTests.CreateAsync_WithValidRequest_ShouldCreatePatientAndReturnDto"
```

### Visual Studio / Rider

1. **Test Explorer**: View → Test Explorer
2. **Run All Tests**: Click "Run All" button
3. **Run Specific Test**: Right-click test → Run
4. **Debug Test**: Right-click test → Debug

## Key Testing Patterns

### 1. Mocking Dependencies

```csharp
private readonly Mock<IPatientRepository> _patientRepositoryMock;
private readonly Mock<IUnitOfWork> _unitOfWorkMock;
private readonly Mock<IMapper> _mapperMock;

public PatientServiceTests()
{
    _patientRepositoryMock = new Mock<IPatientRepository>();
    _unitOfWorkMock = new Mock<IUnitOfWork>();
    _mapperMock = new Mock<IMapper>();
    
    _sut = new PatientService(
        _patientRepositoryMock.Object,
        _unitOfWorkMock.Object,
        _mapperMock.Object);
}
```

### 2. Testing Exceptions

```csharp
[Fact]
public async Task GetAsync_WithNonExistentId_ShouldThrowNotFoundException()
{
    // Arrange
    _repositoryMock.Setup(r => r.GetByIdAsync(999, ct))
        .ReturnsAsync((Patient?)null);
    
    // Act
    var act = async () => await _sut.GetAsync(999, ct);
    
    // Assert
    await act.Should().ThrowAsync<NotFoundException>()
        .WithMessage("*Patient*999*");
}
```

### 3. Verifying Method Calls

```csharp
// Verify method was called exactly once
_repositoryMock.Verify(r => r.AddAsync(patient, ct), Times.Once);

// Verify method was never called
_unitOfWorkMock.Verify(u => u.SaveChangesAsync(ct), Times.Never);

// Verify with specific arguments
_auditLoggerMock.Verify(a => a.LogAsync(
    nameof(MedicalRecord), 1, "Create", "user123", 
    null, It.IsAny<object>(), ct), Times.Once);
```

### 4. Theory Tests (Data-Driven)

```csharp
[Theory]
[InlineData("Admin")]
[InlineData("Doctor")]
[InlineData("Nurse")]
public async Task CreateAsync_WithAuthorizedRole_ShouldCreateRecord(string role)
{
    // Test runs 3 times with different roles
    var result = await _sut.CreateAsync(request, "user", role, ct);
    result.Should().NotBeNull();
}
```

### 5. Controller Tests with Claims

```csharp
// Setup HTTP context with claims for authentication
var claims = new List<Claim>
{
    new(ClaimTypes.NameIdentifier, "user123"),
    new(ClaimTypes.Role, "Doctor")
};
var identity = new ClaimsIdentity(claims, "TestAuth");
var claimsPrincipal = new ClaimsPrincipal(identity);

_controller.ControllerContext = new ControllerContext
{
    HttpContext = new DefaultHttpContext { User = claimsPrincipal }
};
```

## Best Practices Implemented

### ✅ Isolation
- Each test is independent and doesn't affect others
- Mock all external dependencies
- No shared state between tests

### ✅ Clear Intent
- Test names clearly describe what is being tested
- Test organization mirrors production code structure
- Single assertion focus per test

### ✅ Comprehensive Coverage
- Happy path scenarios
- Edge cases and error conditions
- Authorization and validation rules
- Null/empty inputs

### ✅ Maintainability
- No hardcoded values where possible
- Descriptive variable names
- Reusable test fixtures
- Minimal test logic

### ✅ Fast Execution
- No database access (all mocked)
- No external API calls
- No file I/O (except where specifically tested)
- Tests complete in milliseconds

## Code Coverage Goals

- **Service Layer**: 90%+ coverage
- **Controller Layer**: 85%+ coverage
- **Business Logic**: 95%+ coverage

### Current Coverage

Run coverage report:
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutput=./coverage/ /p:CoverletOutputFormat=html
```

Open `coverage/index.html` in browser to view detailed coverage report.

## Adding New Tests

### Template for Service Tests

```csharp
public class YourServiceTests
{
    private readonly Mock<IYourRepository> _repositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly YourService _sut;

    public YourServiceTests()
    {
        _repositoryMock = new Mock<IYourRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _sut = new YourService(_repositoryMock.Object, _unitOfWorkMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task MethodName_Scenario_ExpectedBehavior()
    {
        // Arrange
        
        // Act
        
        // Assert
    }
}
```

## Troubleshooting

### Common Issues

1. **Test fails with NullReferenceException**
   - Ensure all mocks are properly set up
   - Verify mock returns are configured for all called methods

2. **Async test hangs**
   - Use `await` keyword properly
   - Pass CancellationToken.None in tests
   - Ensure mock returns Task.CompletedTask for void async methods

3. **Verify fails even though method was called**
   - Check if parameters match exactly
   - Use `It.IsAny<T>()` for flexible parameter matching
   - Verify async vs sync method signatures

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: dotnet test --no-restore --verbosity normal --logger trx --results-directory TestResults

- name: Publish Test Results
  uses: EnricoMi/publish-unit-test-result-action@v2
  if: always()
  with:
    files: TestResults/**/*.trx
```

## Further Reading

- [xUnit Documentation](https://xunit.net/)
- [Moq Quickstart](https://github.com/moq/moq4/wiki/Quickstart)
- [FluentAssertions Documentation](https://fluentassertions.com/introduction)
- [Unit Testing Best Practices](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Follow existing naming and organizational patterns
