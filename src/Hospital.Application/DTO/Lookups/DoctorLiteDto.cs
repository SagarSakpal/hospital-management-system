namespace Hospital.Application.DTO.Lookups
{
    public class DoctorLiteDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public int SpecializationId { get; set; }
    }
}
