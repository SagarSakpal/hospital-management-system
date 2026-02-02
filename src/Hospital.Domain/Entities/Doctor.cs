namespace Hospital.Domain.Entities;

public class Doctor
{

    public int Id { get; set; }
    public string UserId { get; set; } = default!;  // Identity FK

    public string Name { get; set; } = default!;
    public int SpecializationId { get; set; }
    public int ExperienceYears { get; set; }
    public string Contact { get; set; } = default!;

    // Soft delete
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public Specialization? Specialization { get; set; }
    public ICollection<DoctorPatient> DoctorPatients { get; set; } = new List<DoctorPatient>();

}
