namespace Hospital.Application.DTO.DoctorPatient
{
    public class UnassignPatientRequest
    {
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
    }
}
