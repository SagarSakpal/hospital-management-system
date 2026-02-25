using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDbContext db) : base(db) { }

        public async Task<bool> UserIdExistsAsync(string userId, int? excludeDoctorId = null, CancellationToken ct = default)
        {
            var query = _db.Set<Doctor>().Where(d => !d.IsDeleted && d.UserId == userId);
            if (excludeDoctorId.HasValue)
            {
                query = query.Where(d => d.Id != excludeDoctorId.Value);
            }
            return await query.AnyAsync(ct);
        }

        public async Task<bool> ContactExistsAsync(string contact, int? excludeDoctorId = null, CancellationToken ct = default)
        {
            var query = _db.Set<Doctor>().Where(d => !d.IsDeleted && d.Contact == contact);
            if (excludeDoctorId.HasValue)
            {
                query = query.Where(d => d.Id != excludeDoctorId.Value);
            }
            return await query.AnyAsync(ct);
        }
    }
}
