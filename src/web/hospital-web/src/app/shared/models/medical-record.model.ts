export interface MedicalRecordDto {
  id: number;
  patientId: number;
  patientName?: string | null;
  doctorId: number;
  doctorName?: string | null;
  recordType: string;
  description: string;
  attachmentUrl?: string | null;
  isArchived: boolean;
  isDeleted: boolean;
  createdOn: string;   // ISO
  updatedOn?: string | null; // ISO
}

export interface CreateMedicalRecordRequest {
  patientId: number;
  doctorId: number;
  recordType: string;
  description: string;
}

export interface UpdateMedicalRecordRequest {
  recordType: string;
  description: string;
}

export interface ArchiveMedicalRecordRequest {
  archive: boolean;
  reason?: string | null;
}