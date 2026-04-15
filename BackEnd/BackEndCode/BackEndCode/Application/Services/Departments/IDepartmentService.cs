using BackEndCode.Application.DTOs.Departments;

namespace BackEndCode.Application.Services.Departments;

public interface IDepartmentService
{
    Task<DepartmentReadDto?> GetByIdAsync(int id);
    Task<IEnumerable<DepartmentReadDto>> GetAllAsync();
    Task<DepartmentReadDto> CreateAsync(DepartmentCreateDto dto);
    Task<bool> UpdateAsync(int id, DepartmentUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<(bool Success, string Message)> AddCourseAsync(int departmentId, int courseId);
    Task<(bool Success, string Message)> RemoveCourseAsync(int departmentId, int courseId);
}
