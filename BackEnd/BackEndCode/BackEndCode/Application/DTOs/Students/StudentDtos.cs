namespace BackEndCode.Application.DTOs.Students;

public record StudentCreateDto(string FullName, string Email, int? DepartmentId);
public record StudentUpdateDto(string FullName, string Email, int? DepartmentId);
public record StudentReadDto(int Id, string FullName, string Email, int? DepartmentId, string? DepartmentName);
public record StudentCourseStatusDto(int CourseId, string CourseName, int CreditHours, bool IsEnrolled, decimal? Grade);
public record UpdateStudentGradeDto(decimal? Grade);
