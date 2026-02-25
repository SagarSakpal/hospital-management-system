namespace Hospital.Application.DTO.Search
{
    public class RecordSearchDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string RecordType { get; set; } = default!;
        public bool IsArchived { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
