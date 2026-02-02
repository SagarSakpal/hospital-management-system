namespace Hospital.Domain.Entities;

public class DoctorPatient
{

    public int Id { get; set; }

    public int DoctorId { get; set; }
    public int PatientId { get; set; }

    public bool IsActive { get; set; } = true;

    public Doctor? Doctor { get; set; }
    public Patient? Patient { get; set; }

}
