using Hospital.Application.DTO;

namespace Hospital.Application.Services
{
    public interface IDoctorService
    {
        Task<DoctorDto> CreateAsync(CreateDoctorRequest request, string performedByUserId, CancellationToken ct = default);
        Task<DoctorDto> GetAsync(int id, CancellationToken ct = default);
        Task<List<DoctorDto>> ListAsync(CancellationToken ct = default);
        Task UpdateAsync(int id, UpdateDoctorRequest request, string performedByUserId, CancellationToken ct = default);
        Task SoftDeleteAsync(int id, string performedByUserId, CancellationToken ct = default);
    }
}
