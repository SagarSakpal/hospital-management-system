using Hospital.Application.DTO;

namespace Hospital.Application.Services
{
    public interface IAppointmentService
    {
        Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request, string createdByUserId, CancellationToken ct = default);
        Task<AppointmentDto?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<List<AppointmentDto>> GetAllAsync(CancellationToken ct = default);
    }
}
