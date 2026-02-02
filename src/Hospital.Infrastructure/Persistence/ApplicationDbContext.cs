using Hospital.Domain.Entities;
using Hospital.Domain.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Infrastructure.Persistence
{
    public class ApplicationDbContext
        : IdentityDbContext<ApplicationUser, ApplicationRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();


        public DbSet<Specialization> Specializations => Set<Specialization>();
        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<DoctorPatient> DoctorPatients => Set<DoctorPatient>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<RefreshToken>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.UserId).IsRequired();
                e.Property(x => x.Token).IsRequired();
                e.HasIndex(x => x.Token).IsUnique();
            });

            // DoctorPatient (many-to-many via link entity)
            builder.Entity<DoctorPatient>()
                .HasOne(dp => dp.Doctor)
                .WithMany(d => d.DoctorPatients)
                .HasForeignKey(dp => dp.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<DoctorPatient>()
                .HasOne(dp => dp.Patient)
                .WithMany(p => p.DoctorPatients)
                .HasForeignKey(dp => dp.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

// Appointments
            builder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany() // or .WithMany(d => d.Appointments) if you add collection
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

// MedicalRecords
            builder.Entity<MedicalRecord>()
                .HasOne(m => m.Patient)
                .WithMany()
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<MedicalRecord>()
                .HasOne(m => m.Doctor)
                .WithMany()
                .HasForeignKey(m => m.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Add soft-delete/global filters later for your entities

            builder.Entity<Doctor>().HasQueryFilter(d => !d.IsDeleted);
            builder.Entity<Patient>().HasQueryFilter(p => !p.IsDeleted);
            builder.Entity<MedicalRecord>().HasQueryFilter(m => !m.IsDeleted);

            // Critical for fast conflict detection and schedules
            builder.Entity<Appointment>()
                .HasIndex(a => new { a.DoctorId, a.StartTime });

// Common lookup indexes
            builder.Entity<Patient>()
                .HasIndex(p => p.Name);

            builder.Entity<Patient>()
                .HasIndex(p => p.Condition);

            builder.Entity<Doctor>()
                .HasIndex(d => d.SpecializationId);
        }
    }
}
