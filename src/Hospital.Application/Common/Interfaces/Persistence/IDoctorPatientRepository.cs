using Hospital.Domain.Entities;

namespace Hospital.Application.Common.Interfaces.Persistence
{
    public interface IDoctorPatientRepository : IRepository<DoctorPatient>
    {
        Task<bool> AnyActiveForDoctorAsync(int doctorId, CancellationToken ct = default);
        Task<bool> AnyActiveForPatientAsync(int patientId, CancellationToken ct = default);

        Task<List<DoctorPatient>> GetActiveByDoctorAsync(int doctorId, CancellationToken ct = default);
        Task<List<DoctorPatient>> GetActiveByPatientAsync(int patientId, CancellationToken ct = default);
    }
}
