using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class MedicalRecordRepository : GenericRepository<MedicalRecord>, IMedicalRecordRepository
    {
        public MedicalRecordRepository(ApplicationDbContext db) : base(db) { }

        public Task<MedicalRecord?> GetByIdTrackedAsync(int id, CancellationToken ct = default)
            => _set.Include(m => m.Patient).Include(m => m.Doctor).FirstOrDefaultAsync(m => m.Id == id, ct);

        public async Task<List<MedicalRecord>> ListAllAsync(bool includeArchived, CancellationToken ct = default)
        {
            var q = _set.AsNoTracking().Include(m => m.Patient).Include(m => m.Doctor).Where(m => !m.IsDeleted);
            if (!includeArchived) q = q.Where(m => !m.IsArchived);
            return await q.OrderByDescending(m => m.CreatedOn).ToListAsync(ct);
        }

        public async Task<List<MedicalRecord>> ListByPatientAsync(int patientId, bool includeArchived, CancellationToken ct = default)
        {
            var q = _set.AsNoTracking().Include(m => m.Patient).Include(m => m.Doctor).Where(m => m.PatientId == patientId);
            if (!includeArchived) q = q.Where(m => !m.IsArchived);
            return await q.OrderByDescending(m => m.CreatedOn).ToListAsync(ct);
        }

        public async Task<List<MedicalRecord>> ListByDoctorAsync(int doctorId, bool includeArchived, CancellationToken ct = default)
        {
            var q = _set.AsNoTracking().Include(m => m.Patient).Include(m => m.Doctor).Where(m => m.DoctorId == doctorId);
            if (!includeArchived) q = q.Where(m => !m.IsArchived);
            return await q.OrderByDescending(m => m.CreatedOn).ToListAsync(ct);
        }
    }
}
