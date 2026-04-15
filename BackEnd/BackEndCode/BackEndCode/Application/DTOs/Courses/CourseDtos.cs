namespace BackEndCode.Application.DTOs.Courses;

public record CourseCreateDto(string Name, int CreditHours);
public record CourseUpdateDto(string Name, int CreditHours);
public record CourseReadDto(int Id, string Name, int CreditHours);
