namespace Hospital.Application.DTO
{
    public class UpdateDoctorRequest
    {
        public string Name { get; set; } = default!;
        public int SpecializationId { get; set; }
        public int ExperienceYears { get; set; }
        public string Contact { get; set; } = default!;
    }
}
