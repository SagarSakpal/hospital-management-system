namespace Hospital.Application.DTO.MedicalRecords
{
    public class ArchiveMedicalRecordRequest
    {
        public bool Archive { get; set; } = true;
        public string? Reason { get; set; }
    }
}
