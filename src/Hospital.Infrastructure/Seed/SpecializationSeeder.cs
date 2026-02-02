using Hospital.Domain.Entities;
using Hospital.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Seed
{
    public static class SpecializationSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext db)
        {
            if (await db.Specializations.AnyAsync())
            {
                return; // Already seeded
            }

            var specializations = new[]
            {
                new Specialization { Name = "Cardiology" },
                new Specialization { Name = "Neurology" },
                new Specialization { Name = "Pediatrics" },
                new Specialization { Name = "Orthopedics" },
                new Specialization { Name = "Dermatology" },
                new Specialization { Name = "General Practice" },
                new Specialization { Name = "Emergency Medicine" },
                new Specialization { Name = "Radiology" }
            };

            await db.Specializations.AddRangeAsync(specializations);
            await db.SaveChangesAsync();
        }
    }
}
