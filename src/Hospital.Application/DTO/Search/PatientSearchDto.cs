namespace Hospital.Application.DTO.Search
{
    public class PatientSearchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Condition { get; set; } = default!;
        public string Gender { get; set; } = default!;
        public string Contact { get; set; } = default!;
    }
}
