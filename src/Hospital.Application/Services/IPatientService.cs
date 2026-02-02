using Hospital.Application.DTO;

namespace Hospital.Application.Services
{
    public interface IPatientService
    {
        Task<PatientDto> CreateAsync(CreatePatientRequest request, string actor, CancellationToken ct);
        Task<List<PatientDto>> ListAsync(CancellationToken ct);
        Task<PatientDto> GetAsync(int id, CancellationToken ct);
        Task UpdateAsync(int id, UpdatePatientRequest request, string actor, CancellationToken ct);
        Task SoftDeleteAsync(int id, string actor, CancellationToken ct);
    }
}
