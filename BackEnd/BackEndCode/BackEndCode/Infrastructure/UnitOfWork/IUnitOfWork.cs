using BackEndCode.Domain.Entities;
using BackEndCode.Infrastructure.Repositories;

namespace BackEndCode.Infrastructure.UnitOfWork;

public interface IUnitOfWork
{
    IRepository<Student> Students { get; }
    IRepository<Department> Departments { get; }
    IRepository<Course> Courses { get; }
    IRepository<StudentCourse> StudentCourses { get; }
    IRepository<DepartmentCourse> DepartmentCourses { get; }
    Task<int> CompleteAsync();
}
