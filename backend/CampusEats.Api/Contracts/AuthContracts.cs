using System.ComponentModel.DataAnnotations;

namespace CampusEats.Api.Contracts;

public sealed record RegisterRequest(
    [property: Required, StringLength(100, MinimumLength = 2)] string Name,
    [property: Required, EmailAddress, StringLength(254)] string Email,
    [property: Required, StringLength(128, MinimumLength = 8)] string Password);

public sealed record LoginRequest(
    [property: Required, EmailAddress, StringLength(254)] string Email,
    [property: Required] string Password);

public sealed record UserResponse(int Id, string Name, string Email);

public sealed record AuthResponse(string Token, UserResponse User);
