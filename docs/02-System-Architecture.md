# Hospital Management System - System Architecture

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Layered Architecture](#layered-architecture)
4. [Component Diagrams](#component-diagrams)
5. [Technology Stack](#technology-stack)
6. [Design Patterns](#design-patterns)
7. [Security Architecture](#security-architecture)

---

## Architecture Overview

The Hospital Management System follows a **Layered Architecture** with clear separation of concerns, implementing SOLID principles and industry-standard design patterns.

### Architectural Principles
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Loose Coupling**: Minimal dependencies between components
- **High Cohesion**: Related functionality grouped together
- **Testability**: Easy to unit test and mock dependencies

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Angular SPA (Port 4200)                    │      │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │      │
│  │  │  Auth      │  │  Doctors   │  │  Patients  │     │      │
│  │  │  Module    │  │  Module    │  │  Module    │     │      │
│  │  └────────────┘  └────────────┘  └────────────┘     │      │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │      │
│  │  │Appointments│  │  Records   │  │  Shared    │     │      │
│  │  │  Module    │  │  Module    │  │ Components │     │      │
│  │  └────────────┘  └────────────┘  └────────────┘     │      │
│  └──────────────────────────────────────────────────────┘      │
│                            │                                    │
│                            │ HTTPS / REST API                   │
│                            ▼                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         ASP.NET Core Web API (Port 5000)             │      │
│  │                                                       │      │
│  │  ┌──────────────────────────────────────────────┐   │      │
│  │  │         Presentation Layer (API)             │   │      │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │      │
│  │  │  │  Auth    │ │ Doctors  │ │ Patients │     │   │      │
│  │  │  │Controller│ │Controller│ │Controller│     │   │      │
│  │  │  └──────────┘ └──────────┘ └──────────┘     │   │      │
│  │  │  ┌──────────┐ ┌──────────┐                  │   │      │
│  │  │  │Appoint-  │ │ Records  │                  │   │      │
│  │  │  │ments     │ │Controller│                  │   │      │
│  │  │  │Controller│ └──────────┘                  │   │      │
│  │  │  └──────────┘                               │   │      │
│  │  └──────────────────────────────────────────────┘   │      │
│  │                       │                             │      │
│  │  ┌──────────────────────────────────────────────┐   │      │
│  │  │      Application Layer (Services)            │   │      │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │      │
│  │  │  │  Auth    │ │ Doctor   │ │ Patient  │     │   │      │
│  │  │  │ Service  │ │ Service  │ │ Service  │     │   │      │
│  │  │  └──────────┘ └──────────┘ └──────────┘     │   │      │
│  │  │  ┌──────────┐ ┌──────────┐                  │   │      │
│  │  │  │Appoint-  │ │ Record   │                  │   │      │
│  │  │  │ment      │ │ Service  │                  │   │      │
│  │  │  │Service   │ └──────────┘                  │   │      │
│  │  │  └──────────┘                               │   │      │
│  │  └──────────────────────────────────────────────┘   │      │
│  │                       │                             │      │
│  │  ┌──────────────────────────────────────────────┐   │      │
│  │  │         Domain Layer (Entities)              │   │      │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │   │      │
│  │  │  │Doctor│ │Patient│ │Appt. │ │Record│        │   │      │
│  │  │  └──────┘ └──────┘ └──────┘ └──────┘        │   │      │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐                 │   │      │
│  │  │  │Doctor│ │Special│ │ User │                 │   │      │
│  │  │  │Patient│ │ ization│ │      │                │   │      │
│  │  │  └──────┘ └──────┘ └──────┘                 │   │      │
│  │  └──────────────────────────────────────────────┘   │      │
│  │                       │                             │      │
│  │  ┌──────────────────────────────────────────────┐   │      │
│  │  │    Infrastructure Layer (Data Access)        │   │      │
│  │  │  ┌──────────────────────────────────┐        │   │      │
│  │  │  │   DbContext (EF Core)            │        │   │      │
│  │  │  └──────────────────────────────────┘        │   │      │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │      │
│  │  │  │ Doctor   │ │ Patient  │ │Appoint-  │     │   │      │
│  │  │  │Repository│ │Repository│ │ment Repo │     │   │      │
│  │  │  └──────────┘ └──────────┘ └──────────┘     │   │      │
│  │  │  ┌──────────────────────────────────┐        │   │      │
│  │  │  │    Unit of Work Pattern          │        │   │      │
│  │  │  └──────────────────────────────────┘        │   │      │
│  │  └──────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
│                            │                                    │
│                            │ SQL Connection                     │
│                            ▼                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DATA TIER                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            SQL Server Database                       │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │      │
│  │  │ Doctors  │ │ Patients │ │  Users   │             │      │
│  │  │  Table   │ │  Table   │ │  Table   │             │      │
│  │  └──────────┘ └──────────┘ └──────────┘             │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │      │
│  │  │Appoint-  │ │ Records  │ │ Doctor   │             │      │
│  │  │ments     │ │  Table   │ │ Patient  │             │      │
│  │  │ Table    │ └──────────┘ │  Table   │             │      │
│  │  └──────────┘              └──────────┘             │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CROSS-CUTTING CONCERNS                       │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Logging  │ │  Caching │ │Exception │ │   Auth   │          │
│  │(Serilog) │ │ (Memory) │ │ Handling │ │(JWT/OAuth│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layered Architecture

### 1. Presentation Layer (Hospital.Api)
**Responsibility**: Handle HTTP requests and responses

**Components**:
- Controllers (AuthController, DoctorsController, PatientsController, AppointmentsController)
- DTOs (Data Transfer Objects)
- Request/Response models
- Middleware (Exception handling, authentication)

**Key Features**:
- RESTful API endpoints
- Input validation
- Response formatting
- API versioning
- Swagger documentation

### 2. Application Layer (Hospital.Application)
**Responsibility**: Business logic and orchestration

**Components**:
- Services (AuthService, DoctorService, PatientService, AppointmentService)
- DTOs and mapping profiles
- Validation logic (FluentValidation)
- Business rules

**Key Features**:
- Use case implementation
- Data transformation
- Business rule enforcement
- Transaction coordination

### 3. Domain Layer (Hospital.Domain)
**Responsibility**: Core business entities and domain logic

**Components**:
- Entities (Doctor, Patient, Appointment, MedicalRecord, User)
- Domain models
- Entity relationships
- Business constraints

**Key Features**:
- Pure domain models
- No external dependencies
- Business invariants
- Domain events (optional)

### 4. Infrastructure Layer (Hospital.Infrastructure)
**Responsibility**: Data access and external services

**Components**:
- DbContext (Entity Framework Core)
- Repositories
- Unit of Work
- Migrations
- Database configurations

**Key Features**:
- Data persistence
- Query optimization
- Transaction management
- Database seeding

---

## Component Diagrams

### Authentication Flow
```
┌─────────┐          ┌──────────┐          ┌────────────┐
│ Angular │          │   API    │          │  Database  │
│  Client │          │          │          │            │
└────┬────┘          └────┬─────┘          └─────┬──────┘
     │                    │                       │
     │ POST /auth/login   │                       │
     ├───────────────────>│                       │
     │  (username/pwd)    │                       │
     │                    │ Validate credentials  │
     │                    ├──────────────────────>│
     │                    │                       │
     │                    │<──────────────────────┤
     │                    │   User found          │
     │                    │                       │
     │                    │ Generate JWT token    │
     │                    │                       │
     │<───────────────────┤                       │
     │  { token, refresh, │                       │
     │    role, expires } │                       │
     │                    │                       │
     │ GET /doctors       │                       │
     │ Header: Bearer     │                       │
     ├───────────────────>│                       │
     │                    │ Verify JWT            │
     │                    │                       │
     │                    │ Query doctors         │
     │                    ├──────────────────────>│
     │                    │                       │
     │                    │<──────────────────────┤
     │<───────────────────┤                       │
     │  Doctors list      │                       │
```

### Appointment Booking Flow
```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Patient │     │   API    │     │ Appt       │     │ Database │
│ Client  │     │Controller│     │ Service    │     │          │
└────┬────┘     └────┬─────┘     └─────┬──────┘     └────┬─────┘
     │               │                  │                  │
     │ POST /appts   │                  │                  │
     ├──────────────>│                  │                  │
     │  {doctorId,   │                  │                  │
     │   patientId,  │                  │                  │
     │   startTime}  │                  │                  │
     │               │ CreateAppt()     │                  │
     │               ├─────────────────>│                  │
     │               │                  │ Check conflicts  │
     │               │                  ├─────────────────>│
     │               │                  │                  │
     │               │                  │<─────────────────┤
     │               │                  │ Existing appts   │
     │               │                  │                  │
     │               │                  │ Validate time    │
     │               │                  │ No overlap?      │
     │               │                  │                  │
     │               │                  │ Save appointment │
     │               │                  ├─────────────────>│
     │               │                  │                  │
     │               │<─────────────────┤                  │
     │               │  Appointment     │                  │
     │<──────────────┤  Created         │                  │
     │  201 Created  │                  │                  │
```

---

## Technology Stack

### Backend
```
┌──────────────────────────────────────────────┐
│              .NET Core 8.0                   │
├──────────────────────────────────────────────┤
│  • ASP.NET Core Web API                      │
│  • Entity Framework Core 8.0                 │
│  • Identity & JWT Authentication             │
│  • FluentValidation                          │
│  • AutoMapper                                │
│  • Serilog (Logging)                         │
│  • Swashbuckle (Swagger)                     │
│  • xUnit (Testing)                           │
│  • Moq (Mocking)                             │
└──────────────────────────────────────────────┘
```

### Frontend
```
┌──────────────────────────────────────────────┐
│           Angular 18+                        │
├──────────────────────────────────────────────┤
│  • TypeScript 5.0+                           │
│  • Angular Material                          │
│  • RxJS                                      │
│  • Standalone Components                     │
│  • Signals                                   │
│  • HttpClient                                │
│  • Angular Router                            │
│  • Reactive Forms                            │
│  • Jasmine & Karma (Testing)                 │
└──────────────────────────────────────────────┘
```

### Database
```
┌──────────────────────────────────────────────┐
│         SQL Server 2019+                     │
├──────────────────────────────────────────────┤
│  • Tables with proper indexing               │
│  • Foreign key constraints                   │
│  • Stored procedures (if needed)             │
│  • Views for complex queries                 │
│  • Audit triggers                            │
└──────────────────────────────────────────────┘
```

---

## Design Patterns

### 1. Repository Pattern
```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

public class GenericRepository<T> : IRepository<T> where T : class
{
    private readonly ApplicationDbContext _context;
    private readonly DbSet<T> _dbSet;
    
    // Implementation...
}
```

### 2. Unit of Work Pattern
```csharp
public interface IUnitOfWork : IDisposable
{
    IDoctorRepository Doctors { get; }
    IPatientRepository Patients { get; }
    IAppointmentRepository Appointments { get; }
    
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

### 3. Dependency Injection
```csharp
// Startup registration
services.AddScoped<IUnitOfWork, UnitOfWork>();
services.AddScoped<IDoctorService, DoctorService>();
services.AddScoped<IPatientService, PatientService>();
```

### 4. Factory Pattern (Optional)
```csharp
public interface IServiceFactory
{
    IAuthService CreateAuthService();
    IDoctorService CreateDoctorService();
}
```

### 5. Strategy Pattern (Caching)
```csharp
public interface ICachingStrategy
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration);
}
```

---

## Security Architecture

### Authentication Flow
```
1. User Login
   ├─> Validate Credentials
   ├─> Generate JWT Access Token (15 min)
   ├─> Generate Refresh Token (7 days)
   └─> Return tokens to client

2. API Request
   ├─> Client sends JWT in Authorization header
   ├─> JWT Middleware validates token
   ├─> Extract claims (userId, role)
   └─> Allow/Deny access

3. Token Refresh
   ├─> Access token expired
   ├─> Client sends refresh token
   ├─> Validate refresh token
   └─> Issue new access token
```

### Authorization Layers
```
┌────────────────────────────────────────┐
│      Role-Based Access Control         │
├────────────────────────────────────────┤
│  Admin    → Full access to all         │
│  Doctor   → Patients, Appointments     │
│  Nurse    → Patients, Appointments     │
│  Patient  → Own records only           │
└────────────────────────────────────────┘
```

### Security Implementation
- **JWT Tokens**: Stateless authentication
- **HTTPS**: All communications encrypted
- **Password Hashing**: BCrypt with salt
- **SQL Injection**: Parameterized queries (EF Core)
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: SameSite cookies
- **CORS**: Configured for Angular origin

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API (can run multiple instances)
- Load balancer distribution
- Database connection pooling

### Caching Strategy
```
┌─────────────────────────────────────┐
│         Caching Layers              │
├─────────────────────────────────────┤
│  1. Memory Cache (frequent data)    │
│     - Doctor list                   │
│     - Specializations               │
│                                     │
│  2. Distributed Cache (optional)    │
│     - Redis for multi-instance      │
│                                     │
│  3. Database Query Cache            │
│     - EF Core query caching         │
└─────────────────────────────────────┘
```

### Performance Optimization
- Database indexing on frequently queried columns
- Lazy loading disabled (prevent N+1 queries)
- Pagination for large datasets
- Async/await throughout
- Query optimization with Include()

---

## Monitoring & Logging

### Logging Architecture
```
Application Events
       ↓
   Serilog
       ↓
┌──────┴──────┐
│             │
File          Console
Logs          (Dev)
```

### Log Levels
- **Trace**: Detailed flow
- **Debug**: Development info
- **Information**: General events
- **Warning**: Potential issues
- **Error**: Exceptions
- **Critical**: System failures

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Final
