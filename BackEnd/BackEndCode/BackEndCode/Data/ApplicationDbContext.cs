using BackEndCode.Domain.Entities;
using BackEndCode.Domain.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BackEndCode.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<StudentCourse> StudentCourses => Set<StudentCourse>();
    public DbSet<DepartmentCourse> DepartmentCourses => Set<DepartmentCourse>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Department>()
            .HasIndex(d => d.Name)
            .IsUnique();

        builder.Entity<Course>()
            .HasIndex(c => c.Name)
            .IsUnique();

        builder.Entity<Student>()
            .HasIndex(s => s.Email)
            .IsUnique();

        builder.Entity<StudentCourse>()
            .HasKey(sc => new { sc.StudentId, sc.CourseId });

        builder.Entity<StudentCourse>()
            .HasOne(sc => sc.Student)
            .WithMany(s => s.StudentCourses)
            .HasForeignKey(sc => sc.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentCourse>()
            .HasOne(sc => sc.Course)
            .WithMany(c => c.StudentCourses)
            .HasForeignKey(sc => sc.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentCourse>()
            .Property(sc => sc.Grade)
            .HasPrecision(5, 2);

        builder.Entity<DepartmentCourse>()
            .HasKey(dc => new { dc.DepartmentId, dc.CourseId });

        builder.Entity<DepartmentCourse>()
            .HasOne(dc => dc.Department)
            .WithMany(d => d.DepartmentCourses)
            .HasForeignKey(dc => dc.DepartmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<DepartmentCourse>()
            .HasOne(dc => dc.Course)
            .WithMany(c => c.DepartmentCourses)
            .HasForeignKey(dc => dc.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Student>()
            .HasOne(s => s.Department)
            .WithMany(d => d.Students)
            .HasForeignKey(s => s.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
