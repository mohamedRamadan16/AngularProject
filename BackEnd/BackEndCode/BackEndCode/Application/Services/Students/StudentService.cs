using BackEndCode.Application.DTOs.Students;
using BackEndCode.Data;
using BackEndCode.Domain.Entities;
using BackEndCode.Infrastructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace BackEndCode.Application.Services.Students;

public class StudentService : IStudentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ApplicationDbContext _dbContext;

    public StudentService(IUnitOfWork unitOfWork, ApplicationDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
    }

    public async Task<StudentReadDto?> GetByIdAsync(int id)
    {
        var student = await _dbContext.Students
            .AsNoTracking()
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == id);

        return student is null ? null : Map(student);
    }

    public async Task<IEnumerable<StudentReadDto>> GetAllAsync()
    {
        var students = await _dbContext.Students
            .AsNoTracking()
            .Include(s => s.Department)
            .OrderBy(s => s.FullName)
            .ToListAsync();

        return students.Select(Map);
    }

    public async Task<IEnumerable<StudentCourseStatusDto>> GetStudentCourseStatusesAsync(int studentId)
    {
        var studentExists = await _dbContext.Students
            .AsNoTracking()
            .AnyAsync(s => s.Id == studentId);

        if (!studentExists)
        {
            throw new InvalidOperationException("Student not found.");
        }

        var courses = await _dbContext.Courses
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();

        var enrollments = await _dbContext.StudentCourses
            .AsNoTracking()
            .Where(sc => sc.StudentId == studentId)
            .ToDictionaryAsync(sc => sc.CourseId);

        return courses.Select(course =>
        {
            var isEnrolled = enrollments.TryGetValue(course.Id, out var enrollment);
            return new StudentCourseStatusDto(
                course.Id,
                course.Name,
                course.CreditHours,
                isEnrolled,
                enrollment?.Grade);
        });
    }

    public async Task<IEnumerable<StudentCourseStatusDto>> GetStudentCourseStatusesAsync(string studentEmail)
    {
        var normalizedEmail = NormalizeEmail(studentEmail);
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new InvalidOperationException("Could not resolve current user email from token.");
        }

        var student = await _dbContext.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Email.ToLower() == normalizedEmail);

        if (student is null)
        {
            throw new InvalidOperationException("No student profile found for current user account.");
        }

        var courses = await _dbContext.Courses
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();

        var enrollments = await _dbContext.StudentCourses
            .AsNoTracking()
            .Where(sc => sc.StudentId == student.Id)
            .ToDictionaryAsync(sc => sc.CourseId);

        return courses.Select(course =>
        {
            var isEnrolled = enrollments.TryGetValue(course.Id, out var enrollment);
            return new StudentCourseStatusDto(
                course.Id,
                course.Name,
                course.CreditHours,
                isEnrolled,
                enrollment?.Grade);
        });
    }

    public async Task<StudentReadDto> CreateAsync(StudentCreateDto dto)
    {
        var normalizedEmail = NormalizeEmail(dto.Email);
        var existingStudent = await _dbContext.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Email.ToLower() == normalizedEmail);

        if (existingStudent is not null)
        {
            throw new InvalidOperationException("Student email already exists.");
        }

        Department? department = null;
        if (dto.DepartmentId.HasValue)
        {
            department = await _unitOfWork.Departments.GetByIdAsync(dto.DepartmentId.Value);
            if (department is null)
            {
                throw new InvalidOperationException("Department not found.");
            }
        }

        var student = new Student
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            DepartmentId = dto.DepartmentId
        };

        await _unitOfWork.Students.AddAsync(student);
        await _unitOfWork.CompleteAsync();

        return new StudentReadDto(
            student.Id,
            student.FullName,
            student.Email,
            student.DepartmentId,
            department?.Name);
    }

    public async Task<bool> UpdateAsync(int id, StudentUpdateDto dto)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(id);
        if (student is null)
        {
            return false;
        }

        var normalizedEmail = NormalizeEmail(dto.Email);
        var existingStudentWithEmail = await _dbContext.Students
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id != id && s.Email.ToLower() == normalizedEmail);

        if (existingStudentWithEmail is not null)
        {
            throw new InvalidOperationException("Student email already exists.");
        }

        if (dto.DepartmentId.HasValue)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(dto.DepartmentId.Value);
            if (department is null)
            {
                throw new InvalidOperationException("Department not found.");
            }
        }

        student.FullName = dto.FullName.Trim();
    student.Email = dto.Email.Trim().ToLowerInvariant();
        student.DepartmentId = dto.DepartmentId;

        _unitOfWork.Students.Update(student);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(id);
        if (student is null)
        {
            return false;
        }

        _unitOfWork.Students.Remove(student);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<(bool Success, string Message)> AssignToDepartmentAsync(int studentId, int departmentId)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(studentId);
        if (student is null)
        {
            return (false, "Student not found.");
        }

        var department = await _unitOfWork.Departments.GetByIdAsync(departmentId);
        if (department is null)
        {
            return (false, "Department not found.");
        }

        student.DepartmentId = departmentId;
        _unitOfWork.Students.Update(student);
        await _unitOfWork.CompleteAsync();

        return (true, "Student assigned to department.");
    }

    public async Task<(bool Success, string Message)> RemoveFromDepartmentAsync(int studentId)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(studentId);
        if (student is null)
        {
            return (false, "Student not found.");
        }

        student.DepartmentId = null;
        _unitOfWork.Students.Update(student);
        await _unitOfWork.CompleteAsync();

        return (true, "Student removed from department.");
    }

    public async Task<(bool Success, string Message)> EnrollInCourseAsync(int studentId, int courseId)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(studentId);
        if (student is null)
        {
            return (false, "Student not found.");
        }

        var course = await _unitOfWork.Courses.GetByIdAsync(courseId);
        if (course is null)
        {
            return (false, "Course not found.");
        }

        var relation = await _unitOfWork.StudentCourses.FirstOrDefaultAsync(sc => sc.StudentId == studentId && sc.CourseId == courseId);
        if (relation is not null)
        {
            return (false, "Student is already enrolled in this course.");
        }

        await _unitOfWork.StudentCourses.AddAsync(new StudentCourse
        {
            StudentId = studentId,
            CourseId = courseId
        });
        await _unitOfWork.CompleteAsync();

        return (true, "Student enrolled in course.");
    }

    public async Task<(bool Success, string Message)> UpdateCourseGradeAsync(int studentId, int courseId, decimal? grade)
    {
        if (grade.HasValue && (grade < 0 || grade > 100))
        {
            return (false, "Grade must be between 0 and 100.");
        }

        var relation = await _unitOfWork.StudentCourses
            .FirstOrDefaultAsync(sc => sc.StudentId == studentId && sc.CourseId == courseId);

        if (relation is null)
        {
            return (false, "Student is not enrolled in this course.");
        }

        relation.Grade = grade;
        _unitOfWork.StudentCourses.Update(relation);
        await _unitOfWork.CompleteAsync();

        return (true, "Course grade updated.");
    }

    public async Task<(bool Success, string Message)> RemoveFromCourseAsync(int studentId, int courseId)
    {
        var relation = await _unitOfWork.StudentCourses.FirstOrDefaultAsync(sc => sc.StudentId == studentId && sc.CourseId == courseId);
        if (relation is null)
        {
            return (false, "Student is not enrolled in this course.");
        }

        _unitOfWork.StudentCourses.Remove(relation);
        await _unitOfWork.CompleteAsync();

        return (true, "Student removed from course.");
    }

    private static StudentReadDto Map(Student student)
    {
        return new StudentReadDto(
            student.Id,
            student.FullName,
            student.Email,
            student.DepartmentId,
            student.Department?.Name);
    }

    private static string NormalizeEmail(string email)
    {
        return (email ?? string.Empty).Trim().ToLowerInvariant();
    }
}
