namespace Hospital.Domain.Entities;

public class Appointment
{

    public int Id { get; set; }

    public int DoctorId { get; set; }
    public int PatientId { get; set; }

    public DateTime StartTime { get; set; }    // we’ll enforce 1 hour duration in services
    public DateTime EndTime { get; set; }

    public string Status { get; set; } = "Scheduled"; // Completed/Cancelled later
    public string? Notes { get; set; }

    public string CreatedByUserId { get; set; } = default!;   // Who made the booking (admin/doctor/nurse/patient)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Doctor? Doctor { get; set; }
    public Patient? Patient { get; set; }

}
