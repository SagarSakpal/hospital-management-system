using Hospital.Domain.Entities;

namespace Hospital.Application.Common.Interfaces.Persistence
{
    public interface IMedicalRecordRepository : IRepository<MedicalRecord>
    {
        Task<MedicalRecord?> GetByIdTrackedAsync(int id, CancellationToken ct = default);
        Task<List<MedicalRecord>> ListAllAsync(bool includeArchived, CancellationToken ct = default);
        Task<List<MedicalRecord>> ListByPatientAsync(int patientId, bool includeArchived, CancellationToken ct = default);
        Task<List<MedicalRecord>> ListByDoctorAsync(int doctorId, bool includeArchived, CancellationToken ct = default);
    }
}
