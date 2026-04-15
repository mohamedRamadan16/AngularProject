namespace BackEndCode.Application.DTOs.Auth;

public record RegisterDto(string UserName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, DateTime ExpiresAt);
