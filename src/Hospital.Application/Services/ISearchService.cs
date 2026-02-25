using Hospital.Application.DTO.Search;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Hospital.Application.Services
{
    public interface ISearchService
    {
        Task<List<DoctorSearchDto>> SearchDoctors(string? name, int? specializationId, CancellationToken ct);
        Task<List<PatientSearchDto>> SearchPatients(string? name, string? condition, CancellationToken ct);
        Task<List<RecordSearchDto>> SearchRecords(int? patientId, int? doctorId, bool includeArchived, CancellationToken ct);
    }
}
