namespace BackEndCode.Domain.Entities;

public class DepartmentCourse
{
    public int DepartmentId { get; set; }
    public int CourseId { get; set; }

    public Department Department { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
