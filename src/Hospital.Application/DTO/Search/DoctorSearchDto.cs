namespace Hospital.Application.DTO.Search
{
    public class DoctorSearchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public int SpecializationId { get; set; }
        public int ExperienceYears { get; set; }
        public string Contact { get; set; } = default!;
    }
}
