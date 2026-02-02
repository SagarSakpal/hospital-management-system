namespace Hospital.Application.DTO
{
    public class PatientDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = default!;
        public string Name { get; set; } = default!;
        public DateTime DOB { get; set; }
        public string Gender { get; set; } = default!;
        public string Contact { get; set; } = default!;
        public string Condition { get; set; } = default!;
    }
}
