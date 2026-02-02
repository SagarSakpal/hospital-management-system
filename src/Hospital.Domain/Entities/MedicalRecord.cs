namespace Hospital.Domain.Entities;

public class MedicalRecord
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public int DoctorId { get; set; }

        public string RecordType { get; set; } = default!;   // e.g., "Diagnosis", "LabReport"
        public string Description { get; set; } = default!;
        public string? AttachmentUrl { get; set; }           // file path (dev: local)

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedOn { get; set; }

        public bool IsArchived { get; set; }                 // admin archival
        public bool IsDeleted { get; set; }                  // soft delete

        public Doctor? Doctor { get; set; }
        public Patient? Patient { get; set; }
    }
