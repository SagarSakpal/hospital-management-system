using Hospital.Domain.Entities;

namespace Hospital.Application.Common.Interfaces.Persistence
{
    public interface IAppointmentRepository : IRepository<Appointment>
    {
        Task<bool> HasOverlapAsync(int doctorId, DateTime start, DateTime end, int? excludeAppointmentId = null, CancellationToken ct = default);
    }
}
