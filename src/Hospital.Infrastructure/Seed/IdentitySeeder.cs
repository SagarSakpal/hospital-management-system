using Hospital.Domain.Identity;
using Microsoft.AspNetCore.Identity;

namespace Hospital.Infrastructure.Seed
{
    public static class IdentitySeeder
    {
        private static readonly string[] Roles = new[] { "Admin", "Doctor", "Nurse", "Patient" };

        public static async Task SeedAsync(UserManager<ApplicationUser> users, RoleManager<ApplicationRole> roles)
        {
            foreach (var r in Roles)
            {
                if (!await roles.RoleExistsAsync(r))
                {
                    await roles.CreateAsync(new ApplicationRole { Name = r });
                }
            }

            await EnsureUser(users, roles, "admin@hospital.com", "Admin@123", "Admin");
            await EnsureUser(users, roles, "doctor@hospital.com", "Doctor@123", "Doctor");
            await EnsureUser(users, roles, "nurse@hospital.com", "Nurse@123", "Nurse");
            await EnsureUser(users, roles, "patient@hospital.com", "Patient@123", "Patient");
        }

        private static async Task EnsureUser(
            UserManager<ApplicationUser> users,
            RoleManager<ApplicationRole> roles,
            string email,
            string password,
            string role)
        {
            var user = await users.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = email,
                    UserName = email,
                    EmailConfirmed = true,
                    IsActive = true
                };
                var result = await users.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    var msg = string.Join("; ", result.Errors.Select(e => $"{e.Code}:{e.Description}"));
                    throw new Exception($"Failed creating seed user {email}: {msg}");
                }
            }

            if (!await users.IsInRoleAsync(user, role))
            {
                await users.AddToRoleAsync(user, role);
            }
        }
    }
}
