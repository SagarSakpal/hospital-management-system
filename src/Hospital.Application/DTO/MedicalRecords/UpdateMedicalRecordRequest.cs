namespace Hospital.Application.DTO.MedicalRecords
{
    public class UpdateMedicalRecordRequest
    {
        public string RecordType { get; set; } = default!;
        public string Description { get; set; } = default!;
    }
}
