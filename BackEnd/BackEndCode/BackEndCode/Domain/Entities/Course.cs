namespace BackEndCode.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CreditHours { get; set; }

    public ICollection<StudentCourse> StudentCourses { get; set; } = new List<StudentCourse>();
    public ICollection<DepartmentCourse> DepartmentCourses { get; set; } = new List<DepartmentCourse>();
}
