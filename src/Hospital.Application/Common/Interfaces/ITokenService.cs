using Hospital.Domain.Identity;

namespace Hospital.Application.Common.Interfaces;


public interface ITokenService
{
    (string AccessToken, DateTime ExpiresAt) GenerateAccessToken(ApplicationUser user, IList<string> roles, int? entityId = null);
    string GenerateRefreshToken();
}

