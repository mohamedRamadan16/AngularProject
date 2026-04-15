using BackEndCode.Application.DTOs.Departments;
using BackEndCode.Domain.Entities;
using BackEndCode.Infrastructure.UnitOfWork;

namespace BackEndCode.Application.Services.Departments;

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DepartmentReadDto?> GetByIdAsync(int id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        return department is null ? null : new DepartmentReadDto(department.Id, department.Name);
    }

    public async Task<IEnumerable<DepartmentReadDto>> GetAllAsync()
    {
        var departments = await _unitOfWork.Departments.GetAllAsync();
        return departments.Select(d => new DepartmentReadDto(d.Id, d.Name));
    }

    public async Task<DepartmentReadDto> CreateAsync(DepartmentCreateDto dto)
    {
        var department = new Department
        {
            Name = dto.Name.Trim()
        };

        await _unitOfWork.Departments.AddAsync(department);
        await _unitOfWork.CompleteAsync();

        return new DepartmentReadDto(department.Id, department.Name);
    }

    public async Task<bool> UpdateAsync(int id, DepartmentUpdateDto dto)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department is null)
        {
            return false;
        }

        department.Name = dto.Name.Trim();
        _unitOfWork.Departments.Update(department);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department is null)
        {
            return false;
        }

        _unitOfWork.Departments.Remove(department);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<(bool Success, string Message)> AddCourseAsync(int departmentId, int courseId)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(departmentId);
        if (department is null)
        {
            return (false, "Department not found.");
        }

        var course = await _unitOfWork.Courses.GetByIdAsync(courseId);
        if (course is null)
        {
            return (false, "Course not found.");
        }

        var exists = await _unitOfWork.DepartmentCourses.FirstOrDefaultAsync(dc => dc.DepartmentId == departmentId && dc.CourseId == courseId);
        if (exists is not null)
        {
            return (false, "Course is already assigned to this department.");
        }

        await _unitOfWork.DepartmentCourses.AddAsync(new DepartmentCourse
        {
            DepartmentId = departmentId,
            CourseId = courseId
        });
        await _unitOfWork.CompleteAsync();

        return (true, "Course added to department.");
    }

    public async Task<(bool Success, string Message)> RemoveCourseAsync(int departmentId, int courseId)
    {
        var relation = await _unitOfWork.DepartmentCourses.FirstOrDefaultAsync(dc => dc.DepartmentId == departmentId && dc.CourseId == courseId);
        if (relation is null)
        {
            return (false, "Course is not assigned to this department.");
        }

        _unitOfWork.DepartmentCourses.Remove(relation);
        await _unitOfWork.CompleteAsync();

        return (true, "Course removed from department.");
    }
}
