using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDbContext db) : base(db) { }
    }
}
