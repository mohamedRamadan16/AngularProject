using BackEndCode.Application.DTOs.Courses;

namespace BackEndCode.Application.Services.Courses;

public interface ICourseService
{
    Task<CourseReadDto?> GetByIdAsync(int id);
    Task<IEnumerable<CourseReadDto>> GetAllAsync();
    Task<CourseReadDto> CreateAsync(CourseCreateDto dto);
    Task<bool> UpdateAsync(int id, CourseUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}
