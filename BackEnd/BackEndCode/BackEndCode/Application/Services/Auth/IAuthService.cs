using BackEndCode.Application.DTOs.Auth;

namespace BackEndCode.Application.Services.Auth;

public interface IAuthService
{
    Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto, string role);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}
