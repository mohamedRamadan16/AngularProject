using BackEndCode.Data;
using BackEndCode.Domain.Entities;
using BackEndCode.Infrastructure.Repositories;

namespace BackEndCode.Infrastructure.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Students = new Repository<Student>(context);
        Departments = new Repository<Department>(context);
        Courses = new Repository<Course>(context);
        StudentCourses = new Repository<StudentCourse>(context);
        DepartmentCourses = new Repository<DepartmentCourse>(context);
    }

    public IRepository<Student> Students { get; }
    public IRepository<Department> Departments { get; }
    public IRepository<Course> Courses { get; }
    public IRepository<StudentCourse> StudentCourses { get; }
    public IRepository<DepartmentCourse> DepartmentCourses { get; }

    public Task<int> CompleteAsync()
    {
        return _context.SaveChangesAsync();
    }
}
