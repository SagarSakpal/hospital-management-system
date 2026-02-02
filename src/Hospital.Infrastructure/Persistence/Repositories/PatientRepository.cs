using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        public PatientRepository(ApplicationDbContext db) : base(db) { }
    }
}
