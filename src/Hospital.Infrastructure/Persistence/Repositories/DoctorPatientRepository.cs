using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class DoctorPatientRepository : GenericRepository<DoctorPatient>, IDoctorPatientRepository
    {
        public DoctorPatientRepository(ApplicationDbContext db) : base(db) { }

        public Task<bool> AnyActiveForDoctorAsync(int doctorId, CancellationToken ct = default)
            => _set.AsNoTracking().AnyAsync(x => x.DoctorId == doctorId && x.IsActive, ct);

        public Task<bool> AnyActiveForPatientAsync(int patientId, CancellationToken ct = default)
            => _set.AsNoTracking().AnyAsync(x => x.PatientId == patientId && x.IsActive, ct);

        public Task<List<DoctorPatient>> GetActiveByDoctorAsync(int doctorId, CancellationToken ct = default)
            => _set.AsNoTracking().Where(x => x.DoctorId == doctorId && x.IsActive).ToListAsync(ct);

        public Task<List<DoctorPatient>> GetActiveByPatientAsync(int patientId, CancellationToken ct = default)
            => _set.AsNoTracking().Where(x => x.PatientId == patientId && x.IsActive).ToListAsync(ct);
    }
}
