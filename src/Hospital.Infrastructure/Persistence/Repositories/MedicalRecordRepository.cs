using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Domain.Entities;

namespace Hospital.Infrastructure.Persistence.Repositories
{
    public class MedicalRecordRepository : GenericRepository<MedicalRecord>, IMedicalRecordRepository
    {
        public MedicalRecordRepository(ApplicationDbContext db) : base(db) { }
    }
}
