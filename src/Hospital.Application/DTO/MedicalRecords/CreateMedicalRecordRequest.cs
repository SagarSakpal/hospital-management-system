namespace Hospital.Application.DTO.MedicalRecords
{
    public class CreateMedicalRecordRequest
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }        // author
        public string RecordType { get; set; } = default!;
        public string Description { get; set; } = default!;
        // Attachment will be uploaded in a separate endpoint
    }
}
