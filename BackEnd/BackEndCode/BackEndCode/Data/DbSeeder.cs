using BackEndCode.Domain.Identity;
using BackEndCode.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BackEndCode.Data;

public static class DbSeeder
{
    public static async Task SeedIdentityDataAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        string[] roles = ["Admin", "Student", "User"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        const string adminEmail = "admin@app.com";
        const string adminPassword = "Admin@123";
        const string adminUserName = "admin";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminUserName,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to seed default admin user: {errors}");
            }
        }

        if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
        {
            var addRoleResult = await userManager.AddToRoleAsync(adminUser, "Admin");
            if (!addRoleResult.Succeeded)
            {
                var roleErrors = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign Admin role to default admin user: {roleErrors}");
            }
        }

        const string studentEmail = "student@app.com";
        const string studentPassword = "Student@123";
        const string studentUserName = "student";

        var studentUser = await userManager.FindByEmailAsync(studentEmail);
        if (studentUser is null)
        {
            studentUser = new ApplicationUser
            {
                UserName = studentUserName,
                Email = studentEmail,
                EmailConfirmed = true
            };

            var createStudentResult = await userManager.CreateAsync(studentUser, studentPassword);
            if (!createStudentResult.Succeeded)
            {
                var errors = string.Join("; ", createStudentResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to seed default student user: {errors}");
            }
        }

        if (!await userManager.IsInRoleAsync(studentUser, "Student"))
        {
            var addStudentRoleResult = await userManager.AddToRoleAsync(studentUser, "Student");
            if (!addStudentRoleResult.Succeeded)
            {
                var roleErrors = string.Join("; ", addStudentRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign Student role to default student user: {roleErrors}");
            }
        }

        var studentProfileExists = await dbContext.Students
            .AsNoTracking()
            .AnyAsync(s => s.Email == studentEmail);

        if (!studentProfileExists)
        {
            await dbContext.Students.AddAsync(new Student
            {
                FullName = "Default Student",
                Email = studentEmail,
                DepartmentId = null
            });

            await dbContext.SaveChangesAsync();
        }
    }
}
