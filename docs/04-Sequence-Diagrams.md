# Hospital Management System - Sequence Diagrams

## Table of Contents
1. [User Authentication Flow](#user-authentication-flow)
2. [Doctor Registration Flow](#doctor-registration-flow)
3. [Patient Registration Flow](#patient-registration-flow)
4. [Appointment Booking Flow](#appointment-booking-flow)
5. [Appointment Management Flow](#appointment-management-flow)
6. [Medical Record Creation Flow](#medical-record-creation-flow)
7. [Doctor-Patient Assignment Flow](#doctor-patient-assignment-flow)
8. [Search Functionality Flow](#search-functionality-flow)

---

## User Authentication Flow

### Login Sequence
```
┌─────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│ Angular │       │   Auth   │       │   Auth   │       │  Token   │       │ Database │
│ Client  │       │Controller│       │ Service  │       │ Storage  │       │          │
└────┬────┘       └────┬─────┘       └────┬─────┘       └────┬─────┘       └────┬─────┘
     │                 │                   │                   │                   │
     │ 1. POST /auth/login                │                   │                   │
     │ {username, password}                │                   │                   │
     ├────────────────>│                   │                   │                   │
     │                 │                   │                   │                   │
     │                 │ 2. Login(request) │                   │                   │
     │                 ├──────────────────>│                   │                   │
     │                 │                   │                   │                   │
     │                 │                   │ 3. Query user by username            │
     │                 │                   ├─────────────────────────────────────>│
     │                 │                   │                   │                   │
     │                 │                   │ 4. User entity    │                   │
     │                 │                   │<─────────────────────────────────────┤
     │                 │                   │                   │                   │
     │                 │                   │ 5. Verify password hash               │
     │                 │                   │ (BCrypt.Verify)   │                   │
     │                 │                   │───────────┐       │                   │
     │                 │                   │           │       │                   │
     │                 │                   │<──────────┘       │                   │
     │                 │                   │                   │                   │
     │                 │                   │ 6. Generate JWT token                 │
     │                 │                   │───────────┐       │                   │
     │                 │                   │           │       │                   │
     │                 │                   │<──────────┘       │                   │
     │                 │                   │                   │                   │
     │                 │                   │ 7. Generate refresh token             │
     │                 │                   │───────────┐       │                   │
     │                 │                   │           │       │                   │
     │                 │                   │<──────────┘       │                   │
     │                 │                   │                   │                   │
     │                 │                   │ 8. Save refresh token                 │
     │                 │                   ├─────────────────────────────────────>│
     │                 │                   │                   │                   │
     │                 │                   │ 9. OK             │                   │
     │                 │                   │<─────────────────────────────────────┤
     │                 │                   │                   │                   │
     │                 │ 10. LoginResponse │                   │                   │
     │                 │<──────────────────┤                   │                   │
     │                 │                   │                   │                   │
     │ 11. 200 OK      │                   │                   │                   │
     │ {accessToken,   │                   │                   │                   │
     │  refreshToken,  │                   │                   │                   │
     │  role, expires} │                   │                   │                   │
     │<────────────────┤                   │                   │                   │
     │                 │                   │                   │                   │
     │ 12. Store tokens in localStorage    │                   │                   │
     ├────────────────────────────────────────────────────────>│                   │
     │                 │                   │                   │                   │
     │ 13. Navigate to dashboard           │                   │                   │
     │───────────┐     │                   │                   │                   │
     │           │     │                   │                   │                   │
     │<──────────┘     │                   │                   │                   │
```

### Subsequent API Requests with JWT
```
┌─────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│ Angular │       │   API    │       │   JWT    │       │ Service  │
│ Client  │       │Controller│       │Middleware│       │  Layer   │
└────┬────┘       └────┬─────┘       └────┬─────┘       └────┬─────┘
     │                 │                   │                   │
     │ 1. GET /doctors │                   │                   │
     │ Header: Authorization: Bearer <JWT> │                   │
     ├────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 2. Extract JWT    │                   │
     │                 ├──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │ 3. Validate JWT   │
     │                 │                   │ (signature, exp)  │
     │                 │                   │───────────┐       │
     │                 │                   │           │       │
     │                 │                   │<──────────┘       │
     │                 │                   │                   │
     │                 │                   │ 4. Extract claims │
     │                 │                   │ (userId, role)    │
     │                 │                   │───────────┐       │
     │                 │                   │           │       │
     │                 │                   │<──────────┘       │
     │                 │                   │                   │
     │                 │ 5. Set HttpContext.User               │
     │                 │<──────────────────┤                   │
     │                 │                   │                   │
     │                 │ 6. GetDoctors()   │                   │
     │                 ├─────────────────────────────────────>│
     │                 │                   │                   │
     │                 │ 7. Doctors list   │                   │
     │                 │<─────────────────────────────────────┤
     │                 │                   │                   │
     │ 8. 200 OK       │                   │                   │
     │ [doctors array] │                   │                   │
     │<────────────────┤                   │                   │
```

---

## Doctor Registration Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin  │     │ Doctors  │     │  Doctor  │     │  Unit of │     │ Database │
│ Client  │     │Controller│     │ Service  │     │   Work   │     │          │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │                 │                 │                 │
     │ 1. POST /doctors               │                 │                 │
     │ {name, email, │                │                 │                 │
     │  phone, spec, │                │                 │                 │
     │  license}     │                │                 │                 │
     ├──────────────>│                │                 │                 │
     │               │                │                 │                 │
     │               │ 2. Validate DTO│                │                 │
     │               │ (FluentValidation)              │                 │
     │               │───────────┐    │                │                 │
     │               │           │    │                │                 │
     │               │<──────────┘    │                │                 │
     │               │                │                │                 │
     │               │ 3. CreateDoctor(request)        │                 │
     │               ├───────────────>│                │                 │
     │               │                │                │                 │
     │               │                │ 4. Check license unique          │
     │               │                ├────────────────────────────────>│
     │               │                │                │                 │
     │               │                │ 5. No duplicate│                 │
     │               │                │<────────────────────────────────┤
     │               │                │                │                 │
     │               │                │ 6. Check email unique            │
     │               │                ├────────────────────────────────>│
     │               │                │                │                 │
     │               │                │ 7. No duplicate│                 │
     │               │                │<────────────────────────────────┤
     │               │                │                │                 │
     │               │                │ 8. Map DTO to Entity             │
     │               │                │ (AutoMapper)   │                 │
     │               │                │───────────┐    │                 │
     │               │                │           │    │                 │
     │               │                │<──────────┘    │                 │
     │               │                │                │                 │
     │               │                │ 9. AddDoctor() │                 │
     │               │                ├───────────────>│                 │
     │               │                │                │                 │
     │               │                │                │ 10. INSERT INTO │
     │               │                │                ├────────────────>│
     │               │                │                │                 │
     │               │                │                │ 11. Doctor Id   │
     │               │                │                │<────────────────┤
     │               │                │                │                 │
     │               │                │ 12. SaveChanges()                │
     │               │                ├───────────────>│                 │
     │               │                │                │                 │
     │               │                │ 13. Success    │                 │
     │               │                │<───────────────┤                 │
     │               │                │                │                 │
     │               │ 14. DoctorDto  │                │                 │
     │               │<───────────────┤                │                 │
     │               │                │                │                 │
     │ 15. 201 Created                │                │                 │
     │ {id, name,    │                │                │                 │
     │  email...}    │                │                │                 │
     │<──────────────┤                │                │                 │
```

---

## Appointment Booking Flow

```
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Patient │   │Appoint-  │   │Appoint-  │   │  Unit of │   │ Database │
│ Client  │   │ments     │   │ment      │   │   Work   │   │          │
│         │   │Controller│   │ Service  │   │          │   │          │
└────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │             │               │               │               │
     │ 1. GET /doctors            │               │               │
     ├────────────>│               │               │               │
     │             │ (Returns available doctors)   │               │
     │<────────────┤               │               │               │
     │             │               │               │               │
     │ 2. GET /doctors/:id/schedule?date=2026-02-05                │
     ├────────────>│               │               │               │
     │             │               │               │               │
     │             │ 3. GetDoctorSchedule(id, date)                │
     │             ├──────────────>│               │               │
     │             │               │               │               │
     │             │               │ 4. Query appointments          │
     │             │               │ for doctor on date             │
     │             │               ├──────────────────────────────>│
     │             │               │               │               │
     │             │               │ 5. Existing appointments       │
     │             │               │<──────────────────────────────┤
     │             │               │               │               │
     │             │ 6. Available slots (9am-5pm)  │               │
     │             │<──────────────┤               │               │
     │             │               │               │               │
     │ 7. [Slots]  │               │               │               │
     │<────────────┤               │               │               │
     │             │               │               │               │
     │ 8. POST /appointments       │               │               │
     │ {doctorId, patientId,       │               │               │
     │  startTime, notes}          │               │               │
     ├────────────>│               │               │               │
     │             │               │               │               │
     │             │ 9. CreateAppointment(request)                 │
     │             ├──────────────>│               │               │
     │             │               │               │               │
     │             │               │ 10. Check for conflicts        │
     │             │               │ (same doctor, overlapping time)│
     │             │               ├──────────────────────────────>│
     │             │               │               │               │
     │             │               │ 11. No conflicts found         │
     │             │               │<──────────────────────────────┤
     │             │               │               │               │
     │             │               │ 12. Validate doctor exists     │
     │             │               ├──────────────────────────────>│
     │             │               │               │               │
     │             │               │ 13. Doctor found              │
     │             │               │<──────────────────────────────┤
     │             │               │               │               │
     │             │               │ 14. Validate patient exists    │
     │             │               ├──────────────────────────────>│
     │             │               │               │               │
     │             │               │ 15. Patient found             │
     │             │               │<──────────────────────────────┤
     │             │               │               │               │
     │             │               │ 16. Create appointment entity  │
     │             │               │ (StartTime, EndTime=Start+1h)  │
     │             │               │───────────┐   │               │
     │             │               │           │   │               │
     │             │               │<──────────┘   │               │
     │             │               │               │               │
     │             │               │ 17. AddAppointment()           │
     │             │               ├──────────────>│               │
     │             │               │               │               │
     │             │               │               │ 18. INSERT    │
     │             │               │               ├──────────────>│
     │             │               │               │               │
     │             │               │               │ 19. Success   │
     │             │               │               │<──────────────┤
     │             │               │               │               │
     │             │               │ 20. SaveChanges()              │
     │             │               ├──────────────>│               │
     │             │               │               │               │
     │             │               │ 21. Committed │               │
     │             │               │<──────────────┤               │
     │             │               │               │               │
     │             │ 22. AppointmentDto            │               │
     │             │<──────────────┤               │               │
     │             │               │               │               │
     │ 23. 201 Created             │               │               │
     │ {id, doctorId,              │               │               │
     │  patientId, time}           │               │               │
     │<────────────┤               │               │               │
     │             │               │               │               │
     │ 24. Show success message    │               │               │
     │ "Appointment booked!"       │               │               │
     │───────────┐ │               │               │               │
     │           │ │               │               │               │
     │<──────────┘ │               │               │               │
```

### Conflict Detection Logic
```
┌──────────┐       ┌──────────┐       ┌──────────┐
│Appoint-  │       │ Database │       │ Response │
│ment      │       │  Query   │       │          │
│Service   │       │          │       │          │
└────┬─────┘       └────┬─────┘       └────┬─────┘
     │                   │                   │
     │ 1. Check conflicts for:               │
     │    DoctorId = 5                       │
     │    RequestedStart = 2026-02-05 10:00  │
     │    RequestedEnd = 2026-02-05 11:00    │
     │───────────┐       │                   │
     │           │       │                   │
     │<──────────┘       │                   │
     │                   │                   │
     │ 2. SELECT * FROM Appointments         │
     │    WHERE DoctorId = 5                 │
     │    AND Status = 'Scheduled'           │
     │    AND (                              │
     │      (StartTime < ReqEnd AND EndTime > ReqStart)
     │    )                                  │
     ├──────────────────>│                   │
     │                   │                   │
     │                   │ 3. Execute query  │
     │                   │───────────┐       │
     │                   │           │       │
     │                   │<──────────┘       │
     │                   │                   │
     │ 4. Results (0 or more)                │
     │<──────────────────┤                   │
     │                   │                   │
     │ 5. If count > 0:  │                   │
     │    Throw ConflictException            │
     │──────────────────────────────────────>│
     │                   │                   │
     │                   │    6. 409 Conflict│
     │                   │    "Time slot     │
     │                   │     already taken"│
```

---

## Medical Record Creation Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Doctor  │     │ Medical  │     │ Record   │     │  Unit of │     │ Database │
│ Client  │     │ Records  │     │ Service  │     │   Work   │     │          │
│         │     │Controller│     │          │     │          │     │          │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │                 │                 │                 │
     │ 1. POST /medical-records       │                 │                 │
     │ {patientId,   │                │                 │                 │
     │  diagnosis,   │                │                 │                 │
     │  treatment,   │                │                 │                 │
     │  prescription,│                │                 │                 │
     │  notes}       │                │                 │                 │
     ├──────────────>│                │                 │                 │
     │               │                │                 │                 │
     │               │ 2. Authorize   │                 │                 │
     │               │ (Only Doctor/Admin can create)   │                 │
     │               │───────────┐    │                 │                 │
     │               │           │    │                 │                 │
     │               │<──────────┘    │                 │                 │
     │               │                │                 │                 │
     │               │ 3. CreateMedicalRecord(request)  │                 │
     │               ├───────────────>│                 │                 │
     │               │                │                 │                 │
     │               │                │ 4. Get current user (doctorId)    │
     │               │                │ from JWT claims│                 │
     │               │                │───────────┐    │                 │
     │               │                │           │    │                 │
     │               │                │<──────────┘    │                 │
     │               │                │                │                 │
     │               │                │ 5. Validate patient exists        │
     │               │                ├────────────────────────────────>│
     │               │                │                │                 │
     │               │                │ 6. Patient found│                 │
     │               │                │<────────────────────────────────┤
     │               │                │                │                 │
     │               │                │ 7. Create MedicalRecord entity    │
     │               │                │ - PatientId    │                 │
     │               │                │ - DoctorId (from JWT)             │
     │               │                │ - Diagnosis, Treatment, etc.      │
     │               │                │ - CreatedBy (userId)              │
     │               │                │ - VisitDate (now)                 │
     │               │                │───────────┐    │                 │
     │               │                │           │    │                 │
     │               │                │<──────────┘    │                 │
     │               │                │                │                 │
     │               │                │ 8. AddRecord() │                 │
     │               │                ├───────────────>│                 │
     │               │                │                │                 │
     │               │                │                │ 9. INSERT       │
     │               │                │                ├────────────────>│
     │               │                │                │                 │
     │               │                │                │ 10. Record Id   │
     │               │                │                │<────────────────┤
     │               │                │                │                 │
     │               │                │ 11. SaveChanges()                 │
     │               │                ├───────────────>│                 │
     │               │                │                │                 │
     │               │                │ 12. Success    │                 │
     │               │                │<───────────────┤                 │
     │               │                │                │                 │
     │               │ 13. RecordDto  │                │                 │
     │               │<───────────────┤                │                 │
     │               │                │                │                 │
     │ 14. 201 Created                │                │                 │
     │ {id, patientId,                │                │                 │
     │  diagnosis...} │                │                 │                 │
     │<──────────────┤                │                 │                 │
```

---

## Doctor-Patient Assignment Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin/ │     │ Doctor   │     │ Doctor   │     │  Unit of │     │ Database │
│  Nurse  │     │ Patient  │     │ Patient  │     │   Work   │     │          │
│ Client  │     │Controller│     │ Service  │     │          │     │          │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │                 │                 │                 │
     │ 1. POST /doctor-patients       │                 │                 │
     │ {doctorId,    │                │                 │                 │
     │  patientId,   │                │                 │                 │
     │  notes}       │                │                 │                 │
     ├──────────────>│                │                 │                 │
     │               │                │                 │                 │
     │               │ 2. AssignPatient(request)        │                 │
     │               ├───────────────>│                 │                 │
     │               │                │                 │                 │
     │               │                │ 3. Check doctor exists            │
     │               │                ├────────────────────────────────>│
     │               │                │                │                 │
     │               │                │ 4. Doctor found│                 │
     │               │                │<────────────────────────────────┤
     │               │                │                │                 │
     │               │                │ 5. Check doctor not deleted      │
     │               │                │───────────┐    │                 │
     │               │                │           │    │                 │
     │               │                │<──────────┘    │                 │
     │               │                │                │                 │
     │               │                │ 6. Check patient exists           │
     │               │                ├────────────────────────────────>│
     │               │                │                │                 │
     │               │                │ 7. Patient found│                 │
     │               │                │<────────────────────────────────┤
     │               │                │                │                 │
     │               │                │ 8. Check for active assignment    │
     │               │                │ (avoid duplicates)                │
     │               │                ├────────────────────────────────>│
     │               │                │                │                 │
     │               │                │ 9. No active assignment           │
     │               │                │<────────────────────────────────┤
     │               │                │                │                 │
     │               │                │ 10. Create DoctorPatient entity   │
     │               │                │───────────┐    │                 │
     │               │                │           │    │                 │
     │               │                │<──────────┘    │                 │
     │               │                │                │                 │
     │               │                │ 11. AddAssignment()               │
     │               │                ├───────────────>│                 │
     │               │                │                │                 │
     │               │                │                │ 12. INSERT      │
     │               │                │                ├────────────────>│
     │               │                │                │                 │
     │               │                │                │ 13. Success     │
     │               │                │                │<────────────────┤
     │               │                │                │                 │
     │               │                │ 14. SaveChanges()                 │
     │               │                ├───────────────>│                 │
     │               │                │                │                 │
     │               │ 15. AssignmentDto              │                 │
     │               │<───────────────┤                │                 │
     │               │                │                │                 │
     │ 16. 201 Created                │                │                 │
     │ {id, doctorId,│                │                │                 │
     │  patientId}   │                │                │                 │
     │<──────────────┤                │                │                 │
```

---

## Search Functionality Flow

### Search by Doctor Name
```
┌─────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│ Client  │       │ Doctors  │       │  Doctor  │       │ Database │
│         │       │Controller│       │ Service  │       │          │
└────┬────┘       └────┬─────┘       └────┬─────┘       └────┬─────┘
     │                 │                   │                   │
     │ 1. GET /doctors?search=Smith&spec=1                     │
     ├────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 2. SearchDoctors(name, specId)        │
     │                 ├──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │ 3. Build query:   │
     │                 │                   │ WHERE Name LIKE '%Smith%'
     │                 │                   │ AND SpecId = 1    │
     │                 │                   │ AND IsDeleted = 0 │
     │                 │                   ├──────────────────>│
     │                 │                   │                   │
     │                 │                   │ 4. Matching doctors
     │                 │                   │<──────────────────┤
     │                 │                   │                   │
     │                 │ 5. Doctor DTOs    │                   │
     │                 │<──────────────────┤                   │
     │                 │                   │                   │
     │ 6. 200 OK       │                   │                   │
     │ [doctors]       │                   │                   │
     │<────────────────┤                   │                   │
```

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Final
