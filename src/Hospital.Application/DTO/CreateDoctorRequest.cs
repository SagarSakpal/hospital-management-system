namespace Hospital.Application.DTO
{
    public class CreateDoctorRequest
    {
        public string UserId { get; set; } = default!;
        public string Name { get; set; } = default!;
        public int SpecializationId { get; set; }
        public int ExperienceYears { get; set; }
        public string Contact { get; set; } = default!;
    }
}
