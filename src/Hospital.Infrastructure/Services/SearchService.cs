using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Hospital.Application.DTO.Search;
using Hospital.Application.Services;
using Hospital.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Services
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _db;

        public SearchService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<DoctorSearchDto>> SearchDoctors(string? name, int? specializationId, CancellationToken ct)
        {
            var q = _db.Doctors
                .AsNoTracking()
                .Where(x => !x.IsDeleted);

            if (!string.IsNullOrWhiteSpace(name))
                q = q.Where(x => x.Name.Contains(name));

            if (specializationId.HasValue)
                q = q.Where(x => x.SpecializationId == specializationId.Value);

            return await q
                .OrderBy(x => x.Name)
                .Select(x => new DoctorSearchDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    SpecializationId = x.SpecializationId,
                    ExperienceYears = x.ExperienceYears,
                    Contact = x.Contact
                })
                .ToListAsync(ct);
        }

        public async Task<List<PatientSearchDto>> SearchPatients(string? name, string? condition, CancellationToken ct)
        {
            var q = _db.Patients
                .AsNoTracking()
                .Where(x => !x.IsDeleted);

            if (!string.IsNullOrWhiteSpace(name))
                q = q.Where(x => x.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(condition))
                q = q.Where(x => x.Condition.Contains(condition));

            return await q
                .OrderBy(x => x.Name)
                .Select(x => new PatientSearchDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Condition = x.Condition,
                    Gender = x.Gender,
                    Contact = x.Contact
                })
                .ToListAsync(ct);
        }

        public async Task<List<RecordSearchDto>> SearchRecords(int? patientId, int? doctorId, bool includeArchived, CancellationToken ct)
        {
            var q = _db.MedicalRecords
                .AsNoTracking()
                .Where(x => !x.IsDeleted);

            if (!includeArchived)
                q = q.Where(x => !x.IsArchived);

            if (patientId.HasValue)
                q = q.Where(x => x.PatientId == patientId.Value);

            if (doctorId.HasValue)
                q = q.Where(x => x.DoctorId == doctorId.Value);

            return await q
                .OrderByDescending(x => x.CreatedOn)
                .Select(x => new RecordSearchDto
                {
                    Id = x.Id,
                    PatientId = x.PatientId,
                    DoctorId = x.DoctorId,
                    RecordType = x.RecordType,
                    IsArchived = x.IsArchived,
                    CreatedOn = x.CreatedOn
                })
                .ToListAsync(ct);
        }
    }
}
