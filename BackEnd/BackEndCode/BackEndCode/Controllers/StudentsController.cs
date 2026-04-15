using BackEndCode.Application.DTOs.Students;
using BackEndCode.Application.Services.Students;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BackEndCode.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var students = await _studentService.GetAllAsync();
        return Ok(students);
    }

    [Authorize(Roles = "Student,User")]
    [HttpGet("me/courses")]
    public async Task<IActionResult> GetMyCourses()
    {
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? User.FindFirstValue("email");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new { message = "Unable to identify current user." });
        }

        try
        {
            var courses = await _studentService.GetStudentCourseStatusesAsync(email);
            return Ok(courses);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _studentService.GetByIdAsync(id);
        if (student is null)
        {
            return NotFound();
        }

        return Ok(student);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}/courses")]
    public async Task<IActionResult> GetStudentCourses(int id)
    {
        try
        {
            var courses = await _studentService.GetStudentCourseStatusesAsync(id);
            return Ok(courses);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StudentCreateDto dto)
    {
        try
        {
            var created = await _studentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] StudentUpdateDto dto)
    {
        try
        {
            var updated = await _studentService.UpdateAsync(id, dto);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _studentService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{studentId:int}/department/{departmentId:int}")]
    public async Task<IActionResult> AssignDepartment(int studentId, int departmentId)
    {
        var result = await _studentService.AssignToDepartmentAsync(studentId, departmentId);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{studentId:int}/department")]
    public async Task<IActionResult> RemoveDepartment(int studentId)
    {
        var result = await _studentService.RemoveFromDepartmentAsync(studentId);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{studentId:int}/courses/{courseId:int}")]
    public async Task<IActionResult> EnrollCourse(int studentId, int courseId)
    {
        var result = await _studentService.EnrollInCourseAsync(studentId, courseId);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{studentId:int}/courses/{courseId:int}")]
    public async Task<IActionResult> RemoveCourse(int studentId, int courseId)
    {
        var result = await _studentService.RemoveFromCourseAsync(studentId, courseId);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{studentId:int}/courses/{courseId:int}/grade")]
    public async Task<IActionResult> UpdateCourseGrade(int studentId, int courseId, [FromBody] UpdateStudentGradeDto dto)
    {
        var result = await _studentService.UpdateCourseGradeAsync(studentId, courseId, dto.Grade);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }
}
