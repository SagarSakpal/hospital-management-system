using Hospital.Application.DTO;

namespace Hospital.Application.Services
{
    public interface IAppointmentService
    {
        Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request, string createdByUserId, CancellationToken ct = default);
    }
}
