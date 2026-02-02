namespace Hospital.Application.DTO
{
    public class CreateAppointmentRequest
    {
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public DateTime StartTime { get; set; }  // EndTime will be Start + 1 hour
        public string? Notes { get; set; }
    }
}
