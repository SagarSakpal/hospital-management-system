namespace Hospital.Domain.Entities;

public class Patient
{

    public int Id { get; set; }
    public string UserId { get; set; } = default!;

    public string Name { get; set; } = default!;
    public DateTime DOB { get; set; }
    public string Gender { get; set; } = default!;
    public string Contact { get; set; } = default!;
    public string Condition { get; set; } = default!;

    public bool IsDeleted { get; set; } = false;

    public ICollection<DoctorPatient> DoctorPatients { get; set; } = new List<DoctorPatient>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

}
