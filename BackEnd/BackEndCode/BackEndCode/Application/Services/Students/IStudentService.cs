using BackEndCode.Application.DTOs.Students;

namespace BackEndCode.Application.Services.Students;

public interface IStudentService
{
    Task<StudentReadDto?> GetByIdAsync(int id);
    Task<IEnumerable<StudentReadDto>> GetAllAsync();
    Task<IEnumerable<StudentCourseStatusDto>> GetStudentCourseStatusesAsync(int studentId);
    Task<IEnumerable<StudentCourseStatusDto>> GetStudentCourseStatusesAsync(string studentEmail);
    Task<StudentReadDto> CreateAsync(StudentCreateDto dto);
    Task<bool> UpdateAsync(int id, StudentUpdateDto dto);
    Task<bool> DeleteAsync(int id);
    Task<(bool Success, string Message)> AssignToDepartmentAsync(int studentId, int departmentId);
    Task<(bool Success, string Message)> RemoveFromDepartmentAsync(int studentId);
    Task<(bool Success, string Message)> EnrollInCourseAsync(int studentId, int courseId);
    Task<(bool Success, string Message)> RemoveFromCourseAsync(int studentId, int courseId);
    Task<(bool Success, string Message)> UpdateCourseGradeAsync(int studentId, int courseId, decimal? grade);
}
