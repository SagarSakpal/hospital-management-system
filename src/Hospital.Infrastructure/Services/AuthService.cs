using Hospital.Application.Common.Interfaces;
using Hospital.Application.Common.Settings;
using Hospital.Application.Models.Auth;
using Hospital.Domain.Entities;
using Hospital.Domain.Identity;
using Hospital.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Hospital.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly ApplicationDbContext _db;
        private readonly JwtSettings _jwt;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService,
            ApplicationDbContext db,
            IOptions<JwtSettings> jwtOptions)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _db = db;
            _jwt = jwtOptions.Value;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !user.IsActive)
                throw new UnauthorizedAccessException("Invalid credentials");

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
                throw new UnauthorizedAccessException("Invalid credentials");

            var roles = await _userManager.GetRolesAsync(user);

            var (accessToken, expiresAt) = _tokenService.GenerateAccessToken(user, roles);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // store refresh token (rotate per login)
            await StoreRefreshTokenAsync(user.Id, refreshToken);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Role = roles.FirstOrDefault() ?? string.Empty,
                ExpiresAt = expiresAt
            };
        }

        public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request)
        {
            var token = await _db.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == request.RefreshToken);

            if (token == null || !token.IsActive)
                throw new UnauthorizedAccessException("Invalid refresh token");

            var user = await _userManager.FindByIdAsync(token.UserId);
            if (user == null || !user.IsActive)
                throw new UnauthorizedAccessException("Invalid user");

            var roles = await _userManager.GetRolesAsync(user);
            var (accessToken, expiresAt) = _tokenService.GenerateAccessToken(user, roles);

            // rotate refresh token: revoke old, create new
            token.RevokedAt = DateTime.UtcNow;
            var newRefresh = _tokenService.GenerateRefreshToken();
            await StoreRefreshTokenAsync(user.Id, newRefresh);

            await _db.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = newRefresh,
                Role = roles.FirstOrDefault() ?? string.Empty,
                ExpiresAt = expiresAt
            };
        }

        private async Task StoreRefreshTokenAsync(string userId, string token)
        {
            var rt = new RefreshToken
            {
                UserId = userId,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays)
            };
            _db.RefreshTokens.Add(rt);
            await _db.SaveChangesAsync();
        }
    }
}
