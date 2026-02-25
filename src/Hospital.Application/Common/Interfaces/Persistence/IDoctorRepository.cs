using Hospital.Domain.Entities;

namespace Hospital.Application.Common.Interfaces.Persistence
{
    public interface IDoctorRepository : IRepository<Doctor>
    {
        Task<bool> UserIdExistsAsync(string userId, int? excludeDoctorId = null, CancellationToken ct = default);
        Task<bool> ContactExistsAsync(string contact, int? excludeDoctorId = null, CancellationToken ct = default);
    }
}
