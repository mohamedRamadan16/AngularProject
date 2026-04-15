namespace BackEndCode.Application.DTOs.Departments;

public record DepartmentCreateDto(string Name);
public record DepartmentUpdateDto(string Name);
public record DepartmentReadDto(int Id, string Name);
