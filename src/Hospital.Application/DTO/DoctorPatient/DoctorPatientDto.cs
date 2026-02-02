namespace Hospital.Application.DTO.DoctorPatient
{
    public class DoctorPatientDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public bool IsActive { get; set; }
    }
}
