using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Hospital.Application.DTO.Lookups;

namespace Hospital.Application.Services
{
    public interface ILookupService
    {
        Task<List<SpecializationDto>> GetSpecializationsAsync(CancellationToken ct);
        Task<List<DoctorLiteDto>> GetDoctorsLiteAsync(CancellationToken ct);
    }
}
