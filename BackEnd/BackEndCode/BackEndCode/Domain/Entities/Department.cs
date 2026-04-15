namespace BackEndCode.Domain.Entities;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<DepartmentCourse> DepartmentCourses { get; set; } = new List<DepartmentCourse>();
}
