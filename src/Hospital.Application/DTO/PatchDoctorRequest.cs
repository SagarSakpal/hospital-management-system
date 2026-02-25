namespace Hospital.Application.DTO
{
    /// <summary>
    /// Partial update request for doctor. All fields are optional.
    /// Only provided fields will be updated.
    /// </summary>
    public class PatchDoctorRequest
    {
        public string? Name { get; set; }
        public int? SpecializationId { get; set; }
        public int? ExperienceYears { get; set; }
        public string? Contact { get; set; }
    }
}
