# Hospital Management System - Database Schema & ER Diagrams

## Table of Contents
1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Schemas](#table-schemas)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Constraints](#constraints)
7. [Sample Data](#sample-data)

---

## Database Overview

**Database Name:** HospitalManagementDB  
**DBMS:** SQL Server 2019+  
**Collation:** SQL_Latin1_General_CP1_CI_AS  
**Recovery Model:** Full

### Design Principles
- **Normalization**: 3NF (Third Normal Form)
- **Referential Integrity**: Foreign key constraints
- **Data Integrity**: Check constraints, default values
- **Soft Delete**: IsDeleted flag for sensitive data
- **Audit Trail**: CreatedAt, UpdatedAt, DeletedAt timestamps
- **Indexing**: Strategic indexes for performance

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       Users         │
│─────────────────────│
│ Id (PK)             │
│ Username            │
│ PasswordHash        │
│ Email               │
│ Role                │
│ CreatedAt           │
│ UpdatedAt           │
└──────────┬──────────┘
           │
           │ 1:1 (optional)
           │
    ┌──────┴──────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────────────┐       ┌─────────────────────┐
│      Doctors        │       │     Patients        │
│─────────────────────│       │─────────────────────│
│ Id (PK)             │       │ Id (PK)             │
│ Name                │       │ Name                │
│ SpecializationId(FK)│       │ DateOfBirth         │
│ Email               │       │ Gender              │
│ Phone               │       │ Email               │
│ LicenseNumber       │       │ Phone               │
│ UserId (FK)         │       │ Address             │
│ IsDeleted           │       │ BloodGroup          │
│ CreatedAt           │       │ Condition           │
│ UpdatedAt           │       │ UserId (FK)         │
│ DeletedAt           │       │ IsDeleted           │
└──────────┬──────────┘       │ CreatedAt           │
           │                  │ UpdatedAt           │
           │                  │ DeletedAt           │
           │                  └──────────┬──────────┘
           │                             │
           │  M:N                        │
           │  ┌──────────────────────┐   │
           └─>│   DoctorPatients     │<──┘
              │──────────────────────│
              │ Id (PK)              │
              │ DoctorId (FK)        │
              │ PatientId (FK)       │
              │ AssignedDate         │
              │ IsActive             │
              │ Notes                │
              │ CreatedAt            │
              └──────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Appointments      │   │  MedicalRecords     │
│─────────────────────│   │─────────────────────│
│ Id (PK)             │   │ Id (PK)             │
│ DoctorId (FK)       │   │ PatientId (FK)      │
│ PatientId (FK)      │   │ DoctorId (FK)       │
│ StartTime           │   │ Diagnosis           │
│ EndTime             │   │ Treatment           │
│ Status              │   │ Prescription        │
│ Notes               │   │ VisitDate           │
│ CreatedAt           │   │ FollowUpDate        │
│ UpdatedAt           │   │ Notes               │
│ CreatedBy           │   │ IsDeleted           │
└─────────────────────┘   │ CreatedAt           │
                          │ UpdatedAt           │
                          │ DeletedAt           │
                          │ CreatedBy           │
                          │ ModifiedBy          │
                          └─────────────────────┘

┌─────────────────────┐
│  Specializations    │
│─────────────────────│
│ Id (PK)             │
│ Name                │
│ Description         │
│ CreatedAt           │
└──────────┬──────────┘
           │
           │ 1:M
           │
    (Referenced by Doctors.SpecializationId)
```

---

## Table Schemas

### 1. Users Table
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    Role NVARCHAR(50) NOT NULL CHECK (Role IN ('Admin', 'Doctor', 'Nurse', 'Patient')),
    RefreshToken NVARCHAR(500) NULL,
    RefreshTokenExpiry DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    INDEX IX_Users_Username (Username),
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Role (Role)
);
```

**Purpose**: Store user authentication and authorization data  
**Records**: ~100-1000 users

### 2. Specializations Table
```sql
CREATE TABLE Specializations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    INDEX IX_Specializations_Name (Name)
);
```

**Purpose**: Store medical specializations (Cardiology, Neurology, etc.)  
**Records**: ~20-50 specializations

### 3. Doctors Table
```sql
CREATE TABLE Doctors (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    SpecializationId INT NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NOT NULL,
    LicenseNumber NVARCHAR(100) NOT NULL UNIQUE,
    UserId INT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DeletedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Doctors_Specializations FOREIGN KEY (SpecializationId)
        REFERENCES Specializations(Id),
    CONSTRAINT FK_Doctors_Users FOREIGN KEY (UserId)
        REFERENCES Users(Id),
    
    INDEX IX_Doctors_Name (Name),
    INDEX IX_Doctors_SpecializationId (SpecializationId),
    INDEX IX_Doctors_Email (Email),
    INDEX IX_Doctors_IsDeleted (IsDeleted),
    INDEX IX_Doctors_UserId (UserId)
);
```

**Purpose**: Store doctor information and profiles  
**Records**: ~50-500 doctors

**Business Rules**:
- Cannot delete doctor if assigned to active patients
- LicenseNumber must be unique
- Email must be unique

### 4. Patients Table
```sql
CREATE TABLE Patients (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Gender NVARCHAR(20) NOT NULL CHECK (Gender IN ('Male', 'Female', 'Other')),
    Email NVARCHAR(200) NULL UNIQUE,
    Phone NVARCHAR(20) NOT NULL,
    Address NVARCHAR(500) NULL,
    BloodGroup NVARCHAR(10) NULL,
    Condition NVARCHAR(500) NULL,
    UserId INT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DeletedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Patients_Users FOREIGN KEY (UserId)
        REFERENCES Users(Id),
    
    INDEX IX_Patients_Name (Name),
    INDEX IX_Patients_Email (Email),
    INDEX IX_Patients_Phone (Phone),
    INDEX IX_Patients_IsDeleted (IsDeleted),
    INDEX IX_Patients_Condition (Condition),
    INDEX IX_Patients_UserId (UserId)
);
```

**Purpose**: Store patient information and medical history  
**Records**: ~1000-10000 patients

**Business Rules**:
- DateOfBirth must be in the past
- Age calculated dynamically
- Soft delete to preserve historical data

### 5. DoctorPatients Table (Junction Table)
```sql
CREATE TABLE DoctorPatients (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DoctorId INT NOT NULL,
    PatientId INT NOT NULL,
    AssignedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    Notes NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_DoctorPatients_Doctors FOREIGN KEY (DoctorId)
        REFERENCES Doctors(Id) ON DELETE CASCADE,
    CONSTRAINT FK_DoctorPatients_Patients FOREIGN KEY (PatientId)
        REFERENCES Patients(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_DoctorPatients_Active UNIQUE (DoctorId, PatientId, IsActive),
    
    INDEX IX_DoctorPatients_DoctorId (DoctorId),
    INDEX IX_DoctorPatients_PatientId (PatientId),
    INDEX IX_DoctorPatients_IsActive (IsActive)
);
```

**Purpose**: Track doctor-patient assignments  
**Records**: ~5000-50000 relationships

**Business Rules**:
- One active assignment per doctor-patient pair
- Cannot assign deleted doctors or patients

### 6. Appointments Table
```sql
CREATE TABLE Appointments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DoctorId INT NOT NULL,
    PatientId INT NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Scheduled' 
        CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
    Notes NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy INT NULL,
    
    CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (DoctorId)
        REFERENCES Doctors(Id),
    CONSTRAINT FK_Appointments_Patients FOREIGN KEY (PatientId)
        REFERENCES Patients(Id),
    CONSTRAINT FK_Appointments_CreatedBy FOREIGN KEY (CreatedBy)
        REFERENCES Users(Id),
    CONSTRAINT CHK_Appointments_Time CHECK (EndTime > StartTime),
    
    INDEX IX_Appointments_DoctorId (DoctorId),
    INDEX IX_Appointments_PatientId (PatientId),
    INDEX IX_Appointments_StartTime (StartTime),
    INDEX IX_Appointments_Status (Status),
    INDEX IX_Appointments_DoctorDate (DoctorId, StartTime)
);
```

**Purpose**: Store appointment schedules  
**Records**: ~10000-100000 appointments

**Business Rules**:
- No overlapping appointments for same doctor
- EndTime > StartTime
- StartTime must be in the future (for new bookings)
- Duration typically 1 hour

### 7. MedicalRecords Table
```sql
CREATE TABLE MedicalRecords (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PatientId INT NOT NULL,
    DoctorId INT NOT NULL,
    Diagnosis NVARCHAR(1000) NOT NULL,
    Treatment NVARCHAR(1000) NULL,
    Prescription NVARCHAR(2000) NULL,
    VisitDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FollowUpDate DATETIME2 NULL,
    Notes NVARCHAR(2000) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DeletedAt DATETIME2 NULL,
    CreatedBy INT NOT NULL,
    ModifiedBy INT NULL,
    
    CONSTRAINT FK_MedicalRecords_Patients FOREIGN KEY (PatientId)
        REFERENCES Patients(Id),
    CONSTRAINT FK_MedicalRecords_Doctors FOREIGN KEY (DoctorId)
        REFERENCES Doctors(Id),
    CONSTRAINT FK_MedicalRecords_CreatedBy FOREIGN KEY (CreatedBy)
        REFERENCES Users(Id),
    CONSTRAINT FK_MedicalRecords_ModifiedBy FOREIGN KEY (ModifiedBy)
        REFERENCES Users(Id),
    
    INDEX IX_MedicalRecords_PatientId (PatientId),
    INDEX IX_MedicalRecords_DoctorId (DoctorId),
    INDEX IX_MedicalRecords_VisitDate (VisitDate),
    INDEX IX_MedicalRecords_IsDeleted (IsDeleted),
    INDEX IX_MedicalRecords_Diagnosis (Diagnosis)
);
```

**Purpose**: Store patient medical records with audit trail  
**Records**: ~50000-500000 records

**Business Rules**:
- Soft delete only (preserve audit trail)
- Track who created and modified
- Cannot delete records directly

---

## Relationships

### One-to-Many Relationships

1. **Specializations → Doctors**
   - One specialization can have many doctors
   - Every doctor must have one specialization

2. **Doctors → Appointments**
   - One doctor can have many appointments
   - Every appointment must have one doctor

3. **Patients → Appointments**
   - One patient can have many appointments
   - Every appointment must have one patient

4. **Patients → MedicalRecords**
   - One patient can have many medical records
   - Every record must belong to one patient

5. **Doctors → MedicalRecords**
   - One doctor can create many medical records
   - Every record must have one doctor

### Many-to-Many Relationships

1. **Doctors ↔ Patients** (via DoctorPatients)
   - One doctor can treat many patients
   - One patient can be treated by many doctors
   - Junction table tracks assignment history

### Optional One-to-One Relationships

1. **Users → Doctors**
   - A user may be linked to a doctor profile (optional)
   - Used when a doctor has login access

2. **Users → Patients**
   - A user may be linked to a patient profile (optional)
   - Used when a patient has login access

---

## Indexes

### Primary Indexes (Clustered)
```sql
-- All tables have clustered primary key on Id column
-- Provides fast lookup by primary key
```

### Secondary Indexes (Non-Clustered)

**Doctors Table**:
```sql
CREATE INDEX IX_Doctors_SpecializationId ON Doctors(SpecializationId);
CREATE INDEX IX_Doctors_Name ON Doctors(Name);
CREATE INDEX IX_Doctors_IsDeleted ON Doctors(IsDeleted);
```

**Patients Table**:
```sql
CREATE INDEX IX_Patients_Name ON Patients(Name);
CREATE INDEX IX_Patients_Condition ON Patients(Condition);
CREATE INDEX IX_Patients_IsDeleted ON Patients(IsDeleted);
```

**Appointments Table**:
```sql
CREATE INDEX IX_Appointments_DoctorId ON Appointments(DoctorId);
CREATE INDEX IX_Appointments_PatientId ON Appointments(PatientId);
CREATE INDEX IX_Appointments_StartTime ON Appointments(StartTime);
CREATE INDEX IX_Appointments_DoctorDate ON Appointments(DoctorId, StartTime);
```

### Composite Indexes

**For conflict detection query**:
```sql
CREATE INDEX IX_Appointments_DoctorTimeRange 
ON Appointments(DoctorId, StartTime, EndTime, Status);
```

**For doctor-patient lookup**:
```sql
CREATE INDEX IX_DoctorPatients_Lookup 
ON DoctorPatients(DoctorId, PatientId, IsActive);
```

---

## Constraints

### Primary Key Constraints
- All tables have `Id INT IDENTITY(1,1) PRIMARY KEY`

### Foreign Key Constraints
- Enforce referential integrity
- Cascade deletes where appropriate
- Prevent orphaned records

### Unique Constraints
```sql
-- Users
ALTER TABLE Users ADD CONSTRAINT UQ_Users_Username UNIQUE (Username);
ALTER TABLE Users ADD CONSTRAINT UQ_Users_Email UNIQUE (Email);

-- Doctors
ALTER TABLE Doctors ADD CONSTRAINT UQ_Doctors_Email UNIQUE (Email);
ALTER TABLE Doctors ADD CONSTRAINT UQ_Doctors_LicenseNumber UNIQUE (LicenseNumber);

-- Patients
ALTER TABLE Patients ADD CONSTRAINT UQ_Patients_Email UNIQUE (Email);
```

### Check Constraints
```sql
-- Users role validation
ALTER TABLE Users ADD CONSTRAINT CHK_Users_Role 
    CHECK (Role IN ('Admin', 'Doctor', 'Nurse', 'Patient'));

-- Patients gender validation
ALTER TABLE Patients ADD CONSTRAINT CHK_Patients_Gender 
    CHECK (Gender IN ('Male', 'Female', 'Other'));

-- Appointments status validation
ALTER TABLE Appointments ADD CONSTRAINT CHK_Appointments_Status 
    CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled'));

-- Appointments time validation
ALTER TABLE Appointments ADD CONSTRAINT CHK_Appointments_Time 
    CHECK (EndTime > StartTime);
```

### Default Constraints
```sql
-- Timestamps
DEFAULT GETUTCDATE() for CreatedAt columns
DEFAULT GETUTCDATE() for UpdatedAt columns

-- Soft delete flags
DEFAULT 0 for IsDeleted columns

-- Appointment status
DEFAULT 'Scheduled' for Appointments.Status
```

---

## Sample Data

### Specializations
```sql
INSERT INTO Specializations (Name, Description) VALUES
('Cardiology', 'Heart and cardiovascular system'),
('Neurology', 'Brain and nervous system'),
('Orthopedics', 'Bones, joints, and muscles'),
('Pediatrics', 'Children healthcare'),
('Dermatology', 'Skin conditions'),
('General Medicine', 'General health and wellness');
```

### Users
```sql
INSERT INTO Users (Username, PasswordHash, Email, Role) VALUES
('admin', '$2a$11$hashvalue...', 'admin@hospital.com', 'Admin'),
('dr.smith', '$2a$11$hashvalue...', 'smith@hospital.com', 'Doctor'),
('nurse.jane', '$2a$11$hashvalue...', 'jane@hospital.com', 'Nurse'),
('patient.john', '$2a$11$hashvalue...', 'john@example.com', 'Patient');
```

### Doctors
```sql
INSERT INTO Doctors (Name, SpecializationId, Email, Phone, LicenseNumber) VALUES
('Dr. John Smith', 1, 'smith@hospital.com', '555-0101', 'MD12345'),
('Dr. Sarah Johnson', 2, 'sarah@hospital.com', '555-0102', 'MD12346'),
('Dr. Michael Brown', 3, 'michael@hospital.com', '555-0103', 'MD12347');
```

### Patients
```sql
INSERT INTO Patients (Name, DateOfBirth, Gender, Email, Phone, Condition) VALUES
('John Doe', '1985-03-15', 'Male', 'john@example.com', '555-1001', 'Hypertension'),
('Jane Wilson', '1990-07-22', 'Female', 'jane@example.com', '555-1002', 'Diabetes'),
('Bob Miller', '1978-11-30', 'Male', 'bob@example.com', '555-1003', 'Asthma');
```

---

## Database Diagram (Visual)

```
                    ┌──────────────┐
                    │     Users    │
                    └───────┬──────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
        ┌──────────┐  ┌─────────┐  ┌────────┐
        │ Doctors  │  │ Nurses  │  │Patients│
        └────┬─────┘  └─────────┘  └───┬────┘
             │                          │
             └──────┐          ┌────────┘
                    │          │
                    ▼          ▼
            ┌─────────────────────┐
            │   DoctorPatients    │
            └──────────┬──────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
    ┌──────────────┐      ┌──────────────┐
    │ Appointments │      │Medical Records│
    └──────────────┘      └──────────────┘
```

---

## Migration Scripts

### Create Database
```sql
CREATE DATABASE HospitalManagementDB;
GO

USE HospitalManagementDB;
GO
```

### Create Tables (Order matters due to foreign keys)
```sql
-- 1. Independent tables first
CREATE TABLE Specializations (...);
CREATE TABLE Users (...);

-- 2. Tables with foreign keys
CREATE TABLE Doctors (...);
CREATE TABLE Patients (...);

-- 3. Junction and dependent tables
CREATE TABLE DoctorPatients (...);
CREATE TABLE Appointments (...);
CREATE TABLE MedicalRecords (...);
```

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Final
