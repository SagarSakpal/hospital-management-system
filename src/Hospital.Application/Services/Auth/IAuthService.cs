using Hospital.Application.Models.Auth;

namespace Hospital.Application.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
