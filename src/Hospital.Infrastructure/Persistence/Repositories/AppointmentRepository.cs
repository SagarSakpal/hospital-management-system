using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext db) : base(db) { }

        public async Task<bool> HasOverlapAsync(int doctorId, DateTime start, DateTime end, int? excludeAppointmentId = null, CancellationToken ct = default)
        {
            var q = _set.AsNoTracking()
                .Where(a => a.DoctorId == doctorId &&
                            (start < a.EndTime) &&
                            (a.StartTime < end));

            if (excludeAppointmentId.HasValue)
                q = q.Where(a => a.Id != excludeAppointmentId.Value);

            return await q.AnyAsync(ct);
        }
    }
}
