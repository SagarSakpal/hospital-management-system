# Role-Based Features and UI Guide
## Hospital Management System

---

## Table of Contents
1. [Authentication & Authorization Overview](#authentication--authorization-overview)
2. [Admin Role](#admin-role)
3. [Doctor Role](#doctor-role)
4. [Nurse Role](#nurse-role)
5. [Patient Role](#patient-role)
6. [Feature Comparison Matrix](#feature-comparison-matrix)

---

## Authentication & Authorization Overview

### Security Implementation
- **OAuth 2.0 + JWT (JSON Web Tokens)**
  - Access Token: 15 minutes expiry
  - Refresh Token: 7 days expiry
  - BCrypt password hashing (cost factor: 12)
  - HttpOnly cookies for token storage

### Login Flow (All Roles)
```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN SCREEN                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           🏥 Hospital Management System                     │
│                                                             │
│     ┌─────────────────────────────────────────┐           │
│     │  Username/Email                         │           │
│     │  ┌───────────────────────────────────┐ │           │
│     │  │ user@hospital.com                 │ │           │
│     │  └───────────────────────────────────┘ │           │
│     │                                         │           │
│     │  Password                               │           │
│     │  ┌───────────────────────────────────┐ │           │
│     │  │ ••••••••••                        │ │           │
│     │  └───────────────────────────────────┘ │           │
│     │                                         │           │
│     │  ┌─────────────────────────────────┐   │           │
│     │  │      🔐 SIGN IN                 │   │           │
│     │  └─────────────────────────────────┘   │           │
│     │                                         │           │
│     │  [ ] Remember me    Forgot Password?   │           │
│     └─────────────────────────────────────────┘           │
│                                                             │
│          Role-based redirect after authentication           │
└─────────────────────────────────────────────────────────────┘
```

---

## Admin Role

### 🔑 **Permissions Summary**
✅ **Full System Access** - Can perform ALL operations
- User management (create, edit, delete users)
- Doctor management (CRUD)
- Patient management (CRUD)
- Nurse management (CRUD)
- Appointment management (view all, create, cancel)
- Doctor-Patient assignments
- Medical records (full access)
- System configuration
- Audit logs and reports
- Soft delete management

❌ **Restrictions:**
- Cannot delete doctors with active patient assignments (business rule)
- Cannot permanently delete records (soft delete only)

---

### 📊 **Admin Dashboard UI**

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏥 HMS    [Dashboard] [Users] [Doctors] [Patients] [Reports]  👤Admin│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📊 Dashboard Overview                          🔔 5 Notifications   │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   👥 Users  │  │  👨‍⚕️ Doctors│  │  🤒 Patients│  │  📅 Today   ││
│  │             │  │             │  │             │  │             ││
│  │     245     │  │      45     │  │    1,234    │  │     87      ││
│  │   Active    │  │   Active    │  │  Registered │  │ Appointments││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                      │
│  📈 Quick Stats                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  New Registrations (This Week)        ████████░░░  82%  ↑12% │  │
│  │  Appointment Completion Rate          ██████████  95%  ↑3%   │  │
│  │  System Uptime                        ██████████  99.8%      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📋 Recent Activities                        🔧 Quick Actions         │
│  ┌────────────────────────────────┐  ┌──────────────────────────┐  │
│  │ • Dr. Smith added new patient  │  │  [+ Add User]            │  │
│  │   2 mins ago                   │  │  [+ Add Doctor]          │  │
│  │ • Nurse Jane updated record    │  │  [+ Add Patient]         │  │
│  │   15 mins ago                  │  │  [📊 View Reports]       │  │
│  │ • 5 new appointments scheduled │  │  [⚙️ System Settings]    │  │
│  │   1 hour ago                   │  │                          │  │
│  └────────────────────────────────┘  └──────────────────────────┘  │
│                                                                      │
│  📅 Today's Schedule Overview                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  08:00 AM  Dr. Smith       ██████                             │  │
│  │  09:00 AM  Dr. Johnson     ████████████                       │  │
│  │  10:00 AM  Dr. Williams    ████████                           │  │
│  │  11:00 AM  Dr. Brown       ██████████                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 👥 **User Management Screen**

```
┌──────────────────────────────────────────────────────────────────────┐
│  User Management                                    [+ Add New User] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 Search: [____________]  Filter: [All Roles ▼]  Status: [Active ▼]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ID │ Name         │ Email              │ Role    │ Status │  │  │
│  ├────┼──────────────┼────────────────────┼─────────┼────────┼──┤  │
│  │ 1  │ John Admin   │ admin@hms.com      │ Admin   │ ✅     │⚙️│  │
│  │ 2  │ Dr. Smith    │ smith@hms.com      │ Doctor  │ ✅     │⚙️│  │
│  │ 3  │ Nurse Jane   │ jane@hms.com       │ Nurse   │ ✅     │⚙️│  │
│  │ 4  │ Patient Doe  │ doe@email.com      │ Patient │ ✅     │⚙️│  │
│  │ 5  │ Dr. Johnson  │ johnson@hms.com    │ Doctor  │ ✅     │⚙️│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Actions: ⚙️ = [Edit] [Reset Password] [Deactivate] [View Logs]    │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 👨‍⚕️ **Doctor Management Screen**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Doctor Management                                 [+ Add New Doctor] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 Search: [____________]  Specialization: [All ▼]  Status: [All ▼] │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ID │ Name        │ Specialization  │ Experience │ Patients │  │  │
│  ├────┼─────────────┼─────────────────┼────────────┼──────────┼──┤  │
│  │ 1  │ Dr. Smith   │ Cardiology      │ 15 years   │    45    │⚙️│  │
│  │ 2  │ Dr. Johnson │ Neurology       │ 10 years   │    38    │⚙️│  │
│  │ 3  │ Dr. Williams│ Orthopedics     │ 8 years    │    52    │⚙️│  │
│  │ 4  │ Dr. Brown   │ Pediatrics      │ 12 years   │    67    │⚙️│  │
│  │ 5  │ Dr. Davis   │ General Surgery │ 20 years   │    41    │⚙️│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Actions: ⚙️ = [View Profile] [Edit] [Assign Patients] [Schedule]  │
│           [View Medical Records] [Delete] ⚠️                         │
│                                                                      │
│  ⚠️ Note: Cannot delete doctors with active patient assignments      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 🔗 **Doctor-Patient Assignment Screen**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Doctor-Patient Relationship Management                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Select Doctor: [Dr. Smith - Cardiology ▼]                          │
│                                                                      │
│  📊 Current Assignments (45 active patients)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Patient ID │ Name          │ Assigned Date │ Status    │ Action││
│  ├────────────┼───────────────┼───────────────┼───────────┼───────┤│
│  │ 101        │ John Doe      │ 2026-01-15    │ ✅ Active │ [🗑️]  ││
│  │ 102        │ Jane Smith    │ 2026-01-20    │ ✅ Active │ [🗑️]  ││
│  │ 103        │ Bob Johnson   │ 2025-12-10    │ ✅ Active │ [🗑️]  ││
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ➕ Assign New Patient                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Search Patient: [____________] 🔍                            │  │
│  │                                                               │  │
│  │  Available Patients:                                          │  │
│  │  ☐ Patient #205 - Mary Williams (Cardiology needed)         │  │
│  │  ☐ Patient #206 - Tom Brown (Follow-up required)            │  │
│  │  ☐ Patient #207 - Lisa Davis (New patient)                  │  │
│  │                                                               │  │
│  │  [Cancel]                              [Assign Selected]     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ℹ️ Note: Assignment allows doctor to access patient records and     │
│           prevents doctor deletion until unassigned                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Doctor Role

### 🔑 **Permissions Summary**
✅ **What Doctors CAN Do:**
- View and edit their own profile
- View assigned patients list
- View and create medical records (for assigned patients)
- View appointments (their own schedule)
- Create appointments
- Update appointment status (Complete/Cancel)
- Search patients by name, disease, specialization
- Add clinical notes and diagnoses

❌ **What Doctors CANNOT Do:**
- Create/delete other doctors
- Create/delete patients (system-level)
- Assign/unassign patients (admin/nurse only)
- Delete medical records (soft delete only)
- Access other doctors' schedules (unless authorized)
- Modify system settings
- View audit logs

---

### 📊 **Doctor Dashboard UI**

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏥 HMS   [Dashboard] [My Patients] [Appointments] [Records]  👤Dr.Smith│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Welcome back, Dr. Smith! 👋                     📅 February 4, 2026  │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  👥 My      │  │  📅 Today's │  │  ⏰ Pending │  │  ✅ This    ││
│  │  Patients   │  │  Schedule   │  │  Records    │  │  Week       ││
│  │             │  │             │  │             │  │             ││
│  │     45      │  │      8      │  │      3      │  │     42      ││
│  │  Assigned   │  │Appointments │  │  To Review  │  │ Completed   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                      │
│  📋 Today's Appointments                          🔔 3 Notifications │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Time     │ Patient        │ Type          │ Status    │ Action││
│  ├──────────┼────────────────┼───────────────┼───────────┼───────┤│
│  │ 09:00 AM │ John Doe       │ Follow-up     │ Scheduled │ [📝]  ││
│  │ 10:00 AM │ Jane Smith     │ Consultation  │ Scheduled │ [📝]  ││
│  │ 11:00 AM │ Bob Johnson    │ Check-up      │ Scheduled │ [📝]  ││
│  │ 02:00 PM │ Mary Williams  │ Emergency     │ ⚠️Urgent  │ [📝]  ││
│  │ 03:00 PM │ Tom Brown      │ Follow-up     │ Scheduled │ [📝]  ││
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  🔍 Quick Search                         📊 Recent Activities        │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐  │
│  │ Search patients...         │  │ • Medical record updated     │  │
│  │ [_____________________] 🔍 │  │   for Patient #101           │  │
│  │                            │  │ • Appointment completed      │  │
│  │ By: ☐ Name  ☐ Disease     │  │   Patient #89                │  │
│  │     ☐ ID    ☐ Contact     │  │ • New patient assigned       │  │
│  └────────────────────────────┘  │   Patient #207               │  │
│                                   └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 👥 **My Patients Screen (Doctor View)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  My Patients                                                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 Search: [____________]  Filter: [All Conditions ▼]  Sort: [Name]│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ID  │ Name          │ Age │ Condition      │ Last Visit │ 📋 │  │
│  ├─────┼───────────────┼─────┼────────────────┼────────────┼────┤  │
│  │ 101 │ John Doe      │ 45  │ Hypertension   │ 2026-02-01 │[📝]│  │
│  │ 102 │ Jane Smith    │ 38  │ Diabetes       │ 2026-01-28 │[📝]│  │
│  │ 103 │ Bob Johnson   │ 52  │ Heart Disease  │ 2026-01-25 │[📝]│  │
│  │ 104 │ Mary Williams │ 29  │ Asthma         │ 2026-02-03 │[📝]│  │
│  │ 105 │ Tom Brown     │ 67  │ Arthritis      │ 2026-01-30 │[📝]│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📋 Quick Actions:                                                   │
│  [📝] = [View Full History] [Add Medical Record] [Schedule Appt]    │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 📋 **Medical Record Entry (Doctor)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Medical Record - Patient #101 (John Doe, 45 y/o)                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Patient Info: John Doe | Age: 45 | Blood Type: O+ | Allergies: None│
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Visit Date: [2026-02-04]        Visit Type: [Follow-up ▼]  │  │
│  │                                                               │  │
│  │  Chief Complaint:                                             │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ Chest pain and shortness of breath                     │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Vital Signs:                                                 │  │
│  │  BP: [120/80] mmHg   Heart Rate: [72] bpm   Temp: [98.6] °F │  │
│  │                                                               │  │
│  │  Diagnosis:                                                   │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ Hypertension - controlled with medication              │  │  │
│  │  │ Recommend continued monitoring and lifestyle changes   │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Treatment Plan:                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ 1. Continue Lisinopril 10mg daily                      │  │  │
│  │  │ 2. Low-sodium diet                                     │  │  │
│  │  │ 3. Regular exercise 30min/day                          │  │  │
│  │  │ 4. Follow-up in 4 weeks                                │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Prescriptions: [+ Add Prescription]                          │  │
│  │  • Lisinopril 10mg - 1 tablet daily - 30 days               │  │
│  │                                                               │  │
│  │  Attachments: [📎 Upload Files]                               │  │
│  │  • Lab Results - 2026-02-01.pdf                              │  │
│  │                                                               │  │
│  │  [Cancel]                    [💾 Save Record]  [🖨️ Print]     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📝 Record will be audited: Created by Dr. Smith on 2026-02-04      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Nurse Role

### 🔑 **Permissions Summary**
✅ **What Nurses CAN Do:**
- View all doctors and patients
- Assign/unassign patients to doctors
- Create and manage appointments
- Update appointment status
- View medical records (read-only for most fields)
- Add basic clinical notes (vitals, observations)
- Search patients and doctors
- Register new patients
- Update patient contact information

❌ **What Nurses CANNOT Do:**
- Create/delete doctors
- Delete patients (soft delete only with admin approval)
- Write full medical diagnoses (doctor only)
- Prescribe medications
- Delete medical records
- Access system settings
- Modify user roles

---

### 📊 **Nurse Dashboard UI**

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏥 HMS  [Dashboard] [Patients] [Doctors] [Appointments]  👤Nurse Jane│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Good morning, Nurse Jane! 👋                    📅 February 4, 2026  │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  📅 Today's │  │  ⏰ Check-in│  │  🩺 Vitals  │  │  📝 Notes   ││
│  │  Appts      │  │  Pending    │  │  Pending    │  │  To Add     ││
│  │             │  │             │  │             │  │             ││
│  │     87      │  │      12     │  │      8      │  │      5      ││
│  │  Scheduled  │  │  Waiting    │  │  Pending    │  │  Pending    ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                      │
│  🚨 Priority Tasks                            ⏰ Upcoming Appointments│
│  ┌────────────────────────────────┐  ┌──────────────────────────┐  │
│  │ ⚠️ Patient waiting 15+ mins   │  │ 09:00 AM - Dr. Smith     │  │
│  │    Room 3 - John Doe          │  │ 09:30 AM - Dr. Johnson   │  │
│  │                                │  │ 10:00 AM - Dr. Williams  │  │
│  │ ⚠️ Vitals needed for:         │  │ 10:30 AM - Dr. Brown     │  │
│  │    Patient #102 - Jane Smith  │  │ 11:00 AM - Dr. Davis     │  │
│  │                                │  │                          │  │
│  │ 📋 Discharge paperwork ready: │  │ [View Full Schedule]     │  │
│  │    Patient #89 - Bob Johnson  │  │                          │  │
│  └────────────────────────────────┘  └──────────────────────────┘  │
│                                                                      │
│  🔧 Quick Actions                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  [+ Register New Patient]  [📅 Schedule Appointment]         │  │
│  │  [🔗 Assign Patient to Doctor]  [🩺 Record Vitals]          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 👥 **Patient Management (Nurse View)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Patient Management                           [+ Register New Patient]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 Search: [____________]  Status: [All ▼]  Doctor: [All ▼]        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ID  │ Name       │ Age│Assigned Doctor│Last Visit│Status│⚙️ │  │
│  ├─────┼────────────┼────┼───────────────┼──────────┼──────┼────┤  │
│  │ 101 │ John Doe   │ 45 │ Dr. Smith     │2026-02-01│✅    │[⚙️]│  │
│  │ 102 │ Jane Smith │ 38 │ Dr. Johnson   │2026-01-28│✅    │[⚙️]│  │
│  │ 103 │ Bob Johnson│ 52 │ Dr. Williams  │2026-01-25│⚠️    │[⚙️]│  │
│  │ 104 │ Mary W.    │ 29 │ Not Assigned  │    --    │✅    │[⚙️]│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ⚙️ Actions: [View Details] [Edit Contact] [Assign to Doctor]      │
│             [Schedule Appointment] [Record Vitals] [View History]   │
│                                                                      │
│  ⚠️ = Requires follow-up / ✅ = Active / 🔴 = Critical               │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 🩺 **Vitals Recording Screen (Nurse)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Record Vitals - Patient #101 (John Doe)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Patient: John Doe | Age: 45 | Room: 203 | Doctor: Dr. Smith       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Date/Time: [2026-02-04 09:15 AM]                            │  │
│  │                                                               │  │
│  │  📊 Vital Signs:                                              │  │
│  │                                                               │  │
│  │  Blood Pressure:                                              │  │
│  │  Systolic:  [120] mmHg    Diastolic: [80] mmHg              │  │
│  │                                                               │  │
│  │  Heart Rate:     [72] bpm                                     │  │
│  │  Temperature:    [98.6] °F    Method: [Oral ▼]              │  │
│  │  Respiratory:    [16] breaths/min                            │  │
│  │  Oxygen Sat:     [98] %                                       │  │
│  │  Weight:         [180] lbs    Height: [5'10"]                │  │
│  │                                                               │  │
│  │  Pain Level: 😊 😐 😟 😢 😭                                    │  │
│  │              1   2  3  4  5  (Selected: 2)                   │  │
│  │                                                               │  │
│  │  Notes:                                                       │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ Patient appears comfortable, no distress               │  │  │
│  │  │ Awaiting doctor consultation                           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  [Cancel]                              [💾 Save Vitals]      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ℹ️ Recorded by: Nurse Jane | Doctor will be notified               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Patient Role

### 🔑 **Permissions Summary**
✅ **What Patients CAN Do:**
- View and edit their own profile (limited fields)
- View their own medical records (read-only)
- View their appointments
- Book new appointments (with available doctors)
- Cancel their own appointments (with restrictions)
- View assigned doctors
- Update contact information
- View test results and prescriptions
- Download medical reports

❌ **What Patients CANNOT Do:**
- View other patients' information
- Access doctor profiles (except assigned doctors)
- Modify medical records
- Delete appointments created by staff
- Access system administration
- View other users
- Assign themselves to doctors

---

### 📊 **Patient Dashboard UI**

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏥 HMS    [Dashboard] [My Doctors] [Appointments] [Records]  👤John D│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Welcome back, John! 🏥                          📅 February 4, 2026  │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  👨‍⚕️ My    │  │  📅 Next    │  │  📋 Recent  │  │  💊 Active  ││
│  │  Doctors    │  │  Appt       │  │  Records    │  │  Meds       ││
│  │             │  │             │  │             │  │             ││
│  │      2      │  │  Feb 6      │  │      3      │  │      2      ││
│  │  Assigned   │  │  10:00 AM   │  │  This Month │  │Prescriptions││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                      │
│  📅 Upcoming Appointments                         🔔 2 Notifications │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Date       │ Time     │ Doctor        │ Type      │ Action   │  │
│  ├────────────┼──────────┼───────────────┼───────────┼──────────┤  │
│  │ Feb 6      │ 10:00 AM │ Dr. Smith     │ Follow-up │ [Details]│  │
│  │ Feb 10     │ 02:00 PM │ Dr. Johnson   │ Check-up  │ [Details]│  │
│  │ Feb 15     │ 09:30 AM │ Dr. Smith     │ Lab Work  │ [Details]│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [📅 Book New Appointment]                                           │
│                                                                      │
│  💊 Current Medications                   📋 Recent Test Results     │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐  │
│  │ • Lisinopril 10mg          │  │ • Blood Test - Feb 1, 2026   │  │
│  │   Take once daily          │  │   [📄 View Report]           │  │
│  │   Refills: 2 remaining     │  │ • X-Ray - Jan 28, 2026       │  │
│  │                            │  │   [📄 View Images]           │  │
│  │ • Aspirin 81mg             │  │                              │  │
│  │   Take once daily          │  │                              │  │
│  └────────────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 👨‍⚕️ **My Doctors (Patient View)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  My Doctors                                                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  👨‍⚕️ Assigned Healthcare Team                                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ┌────────┐                                                   │  │
│  │  │  👨‍⚕️   │  Dr. Robert Smith                                │  │
│  │  │ Photo  │  Specialization: Cardiology                       │  │
│  │  └────────┘  Experience: 15 years                             │  │
│  │               Contact: smith@hospital.com                      │  │
│  │               Phone: (555) 123-4567                            │  │
│  │                                                                │  │
│  │               [📅 Book Appointment]  [💬 Send Message]         │  │
│  │               ───────────────────────────────────────────────  │  │
│  │               Last Visit: Feb 1, 2026                          │  │
│  │               Next Appointment: Feb 6, 2026 at 10:00 AM       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ┌────────┐                                                   │  │
│  │  │  👨‍⚕️   │  Dr. Emily Johnson                               │  │
│  │  │ Photo  │  Specialization: Neurology                        │  │
│  │  └────────┘  Experience: 10 years                             │  │
│  │               Contact: johnson@hospital.com                    │  │
│  │               Phone: (555) 234-5678                            │  │
│  │                                                                │  │
│  │               [📅 Book Appointment]  [💬 Send Message]         │  │
│  │               ───────────────────────────────────────────────  │  │
│  │               Last Visit: Jan 20, 2026                         │  │
│  │               Next Appointment: Feb 10, 2026 at 2:00 PM       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ℹ️ To see a different specialist, please contact reception          │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 📅 **Book Appointment (Patient)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Book New Appointment                                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: Select Doctor                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ⦿ Dr. Smith - Cardiology (My assigned doctor)              │  │
│  │  ⦿ Dr. Johnson - Neurology (My assigned doctor)             │  │
│  │  ○ Other doctors (Requires referral)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Step 2: Select Date                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │     February 2026           March 2026                       │  │
│  │  Su Mo Tu We Th Fr Sa    Su Mo Tu We Th Fr Sa               │  │
│  │   1  2  3  4  5  6  7     1  2  3  4  5  6  7               │  │
│  │   8  9 10 11 12 13 14     8  9 10 11 12 13 14               │  │
│  │  15 16 17 18 19 20 21    15 16 17 18 19 20 21               │  │
│  │                                                               │  │
│  │  Selected: February 10, 2026                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Step 3: Select Time Slot                                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Morning Slots:                                              │  │
│  │  [09:00] [10:00] [11:00]                                     │  │
│  │                                                               │  │
│  │  Afternoon Slots:                                             │  │
│  │  [02:00] [03:00] [04:00]                                     │  │
│  │                                                               │  │
│  │  ✅ = Available  ❌ = Booked  ⚠️ = Limited                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Step 4: Add Notes (Optional)                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Reason for visit or special requests:                        │  │
│  │ ┌────────────────────────────────────────────────────────┐  │  │
│  │ │ Follow-up for blood pressure monitoring                │  │  │
│  │ └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Summary:                                                            │
│  Doctor: Dr. Smith | Date: Feb 10, 2026 | Time: 10:00 AM           │
│                                                                      │
│  [Cancel]                                      [✅ Confirm Booking]  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 📋 **Medical Records (Patient View - Read Only)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  My Medical Records                                    [📥 Download]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📋 Visit History                                                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Date       │ Doctor        │ Diagnosis         │ Details     │  │
│  ├────────────┼───────────────┼───────────────────┼─────────────┤  │
│  │ 2026-02-01 │ Dr. Smith     │ Hypertension      │ [View 📄]   │  │
│  │ 2026-01-20 │ Dr. Johnson   │ Migraine          │ [View 📄]   │  │
│  │ 2025-12-15 │ Dr. Smith     │ Routine Check-up  │ [View 📄]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📄 Selected Record: Feb 1, 2026 - Dr. Smith                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Visit Type: Follow-up                                        │  │
│  │  Chief Complaint: Chest pain and shortness of breath         │  │
│  │                                                               │  │
│  │  Vital Signs:                                                 │  │
│  │  • Blood Pressure: 120/80 mmHg                               │  │
│  │  • Heart Rate: 72 bpm                                        │  │
│  │  • Temperature: 98.6°F                                       │  │
│  │                                                               │  │
│  │  Diagnosis:                                                   │  │
│  │  Hypertension - controlled with medication                   │  │
│  │  Recommend continued monitoring and lifestyle changes        │  │
│  │                                                               │  │
│  │  Treatment Plan:                                              │  │
│  │  1. Continue Lisinopril 10mg daily                           │  │
│  │  2. Low-sodium diet                                          │  │
│  │  3. Regular exercise 30min/day                               │  │
│  │  4. Follow-up in 4 weeks                                     │  │
│  │                                                               │  │
│  │  Prescriptions:                                               │  │
│  │  • Lisinopril 10mg - 1 tablet daily - 30 days               │  │
│  │                                                               │  │
│  │  Lab Results:                                                 │  │
│  │  • Blood Test Results - 2026-02-01 [📄 Download PDF]        │  │
│  │                                                               │  │
│  │  Next Appointment: Feb 6, 2026 at 10:00 AM                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ℹ️ Read-only view | Questions? Contact your doctor                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Feature Comparison Matrix

### 📊 **Permissions Overview Table**

| Feature | Admin | Doctor | Nurse | Patient |
|---------|-------|--------|-------|---------|
| **User Management** |
| Create Users | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | Own Profile | Own Profile | Own Profile |
| Delete Users | ✅ (Soft) | ❌ | ❌ | ❌ |
| View All Users | ✅ | ❌ | ❌ | ❌ |
| **Doctor Management** |
| Create Doctors | ✅ | ❌ | ❌ | ❌ |
| Edit Doctor Profile | ✅ | Own Only | ❌ | ❌ |
| Delete Doctors | ✅ (with rules) | ❌ | ❌ | ❌ |
| View All Doctors | ✅ | ✅ | ✅ | Assigned Only |
| **Patient Management** |
| Register Patients | ✅ | ❌ | ✅ | ❌ |
| Edit Patient Info | ✅ | Assigned | Assigned | Own Only |
| Delete Patients | ✅ (Soft) | ❌ | ❌ | ❌ |
| View All Patients | ✅ | Assigned | ✅ | Own Only |
| **Doctor-Patient Assignment** |
| Assign Patient to Doctor | ✅ | ❌ | ✅ | ❌ |
| Unassign Patient | ✅ | ❌ | ✅ | ❌ |
| View Assignments | ✅ | Own Patients | ✅ | Own Doctors |
| **Appointments** |
| Create Appointment | ✅ | ✅ | ✅ | ✅ (Limited) |
| View All Appointments | ✅ | Own Schedule | ✅ | Own Only |
| Update Appointment | ✅ | ✅ | ✅ | Cancel Only |
| Delete/Cancel | ✅ | ✅ | ✅ | Own Only |
| **Medical Records** |
| Create Records | ✅ | ✅ | Vitals Only | ❌ |
| View Records | ✅ | Assigned Patients | ✅ | Own Only |
| Edit Records | ✅ | ✅ | Vitals Only | ❌ |
| Delete Records | ✅ (Soft) | ❌ | ❌ | ❌ |
| Download Records | ✅ | ✅ | ✅ | Own Only |
| **Search & Reports** |
| Search Patients | ✅ | Assigned | ✅ | ❌ |
| Search by Disease | ✅ | ✅ | ✅ | ❌ |
| Search by Specialization | ✅ | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | Limited | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ |
| **System Administration** |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Backup/Restore | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | Limited | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ |

---

## Security Features

### 🔒 **Common Security Across All Roles**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Security Features                                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Authentication:                                                  │
│     • OAuth 2.0 + JWT tokens                                        │
│     • 15-minute access token expiry                                 │
│     • 7-day refresh token                                           │
│     • Secure password hashing (BCrypt cost 12)                      │
│                                                                      │
│  2. Session Management:                                              │
│     • Automatic logout on inactivity (30 minutes)                   │
│     • Single sign-on (SSO) support                                  │
│     • Multi-device tracking                                         │
│                                                                      │
│  3. Audit Trail:                                                     │
│     • All actions logged with timestamp                             │
│     • User ID, action type, affected resources                      │
│     • IP address and device information                             │
│     • Immutable audit records                                       │
│                                                                      │
│  4. Data Protection:                                                 │
│     • Soft delete (no permanent data loss)                          │
│     • Encrypted sensitive data at rest                              │
│     • HTTPS/TLS for data in transit                                 │
│     • HIPAA compliance measures                                     │
│                                                                      │
│  5. Access Control:                                                  │
│     • Role-based permissions (RBAC)                                 │
│     • Resource-level authorization                                  │
│     • API rate limiting                                             │
│     • CORS policy enforcement                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Key Business Rules Summary

### ⚠️ **System-Wide Constraints**

1. **Doctor Deletion Protection**
   - Cannot delete doctors with active patient assignments
   - Must unassign all patients first
   - Soft delete preserves historical data

2. **Appointment Conflict Prevention**
   - No overlapping time slots for same doctor
   - 1-hour fixed duration per appointment
   - Real-time availability checking

3. **Medical Record Integrity**
   - All changes audited with timestamp and user
   - Soft delete only (no permanent deletion)
   - Doctor-only diagnosis and prescription authority

4. **Patient-Doctor Assignment**
   - Cannot assign same patient to same doctor twice (if active)
   - Assignment required to prevent doctor deletion
   - No assignment required for booking appointments

5. **Role-Based Data Access**
   - Patients see only their own data
   - Doctors see only assigned patients
   - Nurses see all patients (limited edit)
   - Admin has full visibility

---

## API Endpoints Summary

### 🔌 **Key API Routes by Role**

| Endpoint | Admin | Doctor | Nurse | Patient |
|----------|-------|--------|-------|---------|
| `POST /api/v1/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/auth/refresh` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/doctors` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/v1/doctors` | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/v1/doctors/{id}` | ✅ | Own | ❌ | ❌ |
| `DELETE /api/v1/doctors/{id}` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/v1/patients` | ✅ | Assigned | ✅ | Own |
| `POST /api/v1/patients` | ✅ | ❌ | ✅ | ❌ |
| `PUT /api/v1/patients/{id}` | ✅ | Assigned | ✅ | Own |
| `POST /api/v1/appointments` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/appointments/doctor/{id}` | ✅ | Own | ✅ | ❌ |
| `GET /api/v1/appointments/patient/{id}` | ✅ | Assigned | ✅ | Own |
| `POST /api/v1/relationships/assign` | ✅ | ❌ | ✅ | ❌ |
| `POST /api/v1/relationships/unassign` | ✅ | ❌ | ✅ | ❌ |

---

## Conclusion

This role-based system ensures:
- **Security**: Strong authentication and authorization
- **Privacy**: Data access restricted by role
- **Compliance**: HIPAA-ready audit trails
- **Usability**: Role-specific interfaces and workflows
- **Integrity**: Business rules prevent data inconsistencies

Each role has clearly defined responsibilities and appropriate UI/UX tailored to their daily tasks in the hospital management workflow.

---

*Document Version: 1.0*  
*Last Updated: February 4, 2026*
