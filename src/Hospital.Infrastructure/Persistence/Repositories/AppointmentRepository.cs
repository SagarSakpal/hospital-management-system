using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext db) : base(db) { }

        public override async Task<Appointment?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return await _set
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.Id == id, ct);
        }

        public override async Task<IReadOnlyList<Appointment>> ListAsync(Expression<Func<Appointment, bool>>? predicate = null, CancellationToken ct = default)
        {
            var query = _set
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .AsNoTracking();

            return predicate == null
                ? await query.ToListAsync(ct)
                : await query.Where(predicate).ToListAsync(ct);
        }

        public async Task<bool> HasOverlapAsync(int doctorId, DateTime start, DateTime end,
            int? excludeAppointmentId = null, CancellationToken ct = default)
        {
            var query = _set.AsNoTracking().Where(a =>
                a.DoctorId == doctorId &&
                (start < a.EndTime) &&
                (a.StartTime < end));

            if (excludeAppointmentId.HasValue)
                query = query.Where(a => a.Id != excludeAppointmentId.Value);

            return await query.AnyAsync(ct);
        }
    }
}
