using BackEndCode.Application.DTOs.Courses;
using BackEndCode.Domain.Entities;
using BackEndCode.Infrastructure.UnitOfWork;

namespace BackEndCode.Application.Services.Courses;

public class CourseService : ICourseService
{
    private readonly IUnitOfWork _unitOfWork;

    public CourseService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CourseReadDto?> GetByIdAsync(int id)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(id);
        return course is null ? null : new CourseReadDto(course.Id, course.Name, course.CreditHours);
    }

    public async Task<IEnumerable<CourseReadDto>> GetAllAsync()
    {
        var courses = await _unitOfWork.Courses.GetAllAsync();
        return courses.Select(c => new CourseReadDto(c.Id, c.Name, c.CreditHours));
    }

    public async Task<CourseReadDto> CreateAsync(CourseCreateDto dto)
    {
        var course = new Course
        {
            Name = dto.Name.Trim(),
            CreditHours = dto.CreditHours
        };

        await _unitOfWork.Courses.AddAsync(course);
        await _unitOfWork.CompleteAsync();

        return new CourseReadDto(course.Id, course.Name, course.CreditHours);
    }

    public async Task<bool> UpdateAsync(int id, CourseUpdateDto dto)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(id);
        if (course is null)
        {
            return false;
        }

        course.Name = dto.Name.Trim();
        course.CreditHours = dto.CreditHours;
        _unitOfWork.Courses.Update(course);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(id);
        if (course is null)
        {
            return false;
        }

        _unitOfWork.Courses.Remove(course);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}
