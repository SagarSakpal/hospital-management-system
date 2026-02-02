using Hospital.Domain.Entities;
using Hospital.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Seed
{
    public static class PatientSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext db)
        {
            if (await db.Patients.AnyAsync())
            {
                return; // Already seeded
            }

            // Get the patient user ID
            var patientUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "patient@hospital.com");
            if (patientUser == null) return;

            var patients = new[]
            {
                new Patient
                {
                    UserId = patientUser.Id,
                    Name = "John Doe",
                    DOB = new DateTime(1990, 5, 15),
                    Gender = "Male",
                    Contact = "+1-555-1234",
                    Condition = "Hypertension"
                },
                new Patient
                {
                    UserId = patientUser.Id,
                    Name = "Jane Smith",
                    DOB = new DateTime(1985, 8, 22),
                    Gender = "Female",
                    Contact = "+1-555-5678",
                    Condition = "Diabetes"
                }
            };

            await db.Patients.AddRangeAsync(patients);
            await db.SaveChangesAsync();
        }
    }
}
