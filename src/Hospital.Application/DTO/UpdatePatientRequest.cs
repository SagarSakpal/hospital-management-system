namespace Hospital.Application.DTO
{
    public class UpdatePatientRequest
    {
        public string Name { get; set; } = default!;
        public DateTime DOB { get; set; }
        public string Gender { get; set; } = default!;
        public string Contact { get; set; } = default!;
        public string Condition { get; set; } = default!;
    }
}
