using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Hospital.Application.Common.Interfaces;
using Hospital.Application.Common.Settings;
using Hospital.Application.DTO.Lookups;
using Hospital.Application.Services;
using Hospital.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Hospital.Infrastructure.Services
{
    public class LookupService : ILookupService
    {
        private readonly ApplicationDbContext _db;
        private readonly IAppCache _cache;
        private readonly CacheSettings _settings;

        private const string SPECIALIZATIONS_KEY = "lookups:specializations";
        private const string DOCTORS_LITE_KEY    = "lookups:doctors-lite";

        public LookupService(
            ApplicationDbContext db,
            IAppCache cache,
            IOptions<CacheSettings> settings)
        {
            _db = db;
            _cache = cache;
            _settings = settings.Value;
        }

        public Task<List<SpecializationDto>> GetSpecializationsAsync(CancellationToken ct)
        {
            var ttl = TimeSpan.FromSeconds(_settings.SpecializationsTtlSeconds);
            return _cache.GetOrSetAsync(
                SPECIALIZATIONS_KEY,
                async _ =>
                {
                    var q = _db.Specializations.AsNoTracking().OrderBy(s => s.Name);
                    return await q.Select(s => new SpecializationDto { Id = s.Id, Name = s.Name }).ToListAsync(ct);
                },
                ttl,
                ct);
        }

        public Task<List<DoctorLiteDto>> GetDoctorsLiteAsync(CancellationToken ct)
        {
            var ttl = TimeSpan.FromSeconds(_settings.DoctorsLiteTtlSeconds);
            return _cache.GetOrSetAsync(
                DOCTORS_LITE_KEY,
                async _ =>
                {
                    // Only non-deleted doctors; small payload (Id, Name, SpecializationId)
                    var q = _db.Doctors.AsNoTracking().Where(d => !d.IsDeleted).OrderBy(d => d.Name);
                    return await q.Select(d => new DoctorLiteDto
                    {
                        Id = d.Id,
                        Name = d.Name,
                        SpecializationId = d.SpecializationId
                    }).ToListAsync(ct);
                },
                ttl,
                ct);
        }
    }
}
