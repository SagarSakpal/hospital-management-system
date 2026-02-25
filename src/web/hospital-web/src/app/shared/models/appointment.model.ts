export interface CreateAppointmentRequest {
  doctorId: number;
  patientId: number;
  startTime: string;  // ISO 8601 UTC string (e.g., "2026-02-01T10:00:00Z")
  notes?: string;
}

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  doctorName?: string;
  patientName?: string;
  startTime: string;   // ISO
  endTime: string;     // ISO
  status: string;
  notes?: string;
}