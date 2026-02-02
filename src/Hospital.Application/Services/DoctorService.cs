using AutoMapper;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO;
using Hospital.Domain.Entities;

namespace Hospital.Application.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctors;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IPatientRepository _patients; // to check assignments via DoctorPatient in future (or a DoctorPatient repo)
        private readonly IDoctorPatientRepository _doctorPatients;

        public DoctorService(IDoctorRepository doctors, IPatientRepository patients,IDoctorPatientRepository doctorPatients, IUnitOfWork uow, IMapper mapper)
        {
            _doctors = doctors;
            _patients = patients;
            _doctorPatients = doctorPatients;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<DoctorDto> CreateAsync(CreateDoctorRequest request, string performedByUserId, CancellationToken ct = default)
        {
            var entity = _mapper.Map<Doctor>(request);
            await _doctors.AddAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            // TODO: Write AuditLog here (Day 10)
            return _mapper.Map<DoctorDto>(entity);
        }

        public async Task<DoctorDto> GetAsync(int id, CancellationToken ct = default)
        {
            var entity = await _doctors.GetByIdAsync(id, ct)
                ?? throw new NotFoundException(nameof(Doctor), id);

            return _mapper.Map<DoctorDto>(entity);
        }

        public async Task<List<DoctorDto>> ListAsync(CancellationToken ct = default)
        {
            var list = await _doctors.ListAsync(null, ct);
            return list.Select(d => _mapper.Map<DoctorDto>(d)).ToList();
        }

        public async Task UpdateAsync(int id, UpdateDoctorRequest request, string performedByUserId, CancellationToken ct = default)
        {
            var entity = await _doctors.GetByIdAsync(id, ct)
                ?? throw new NotFoundException(nameof(Doctor), id);

            _mapper.Map(request, entity);
            await _doctors.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            // TODO: Audit
        }

        public async Task SoftDeleteAsync(int id, string performedByUserId, CancellationToken ct = default)
        {
            var entity = await _doctors.GetByIdAsync(id, ct)
                         ?? throw new NotFoundException(nameof(Doctor), id);

            // Business rule: prevent deleting a doctor that has active patients
            if (await _doctorPatients.AnyActiveForDoctorAsync(id, ct))
                throw new BusinessRuleException("Cannot delete this doctor because there are active patient assignments.");

            entity.IsDeleted = true; // soft delete
            await _doctors.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            // TODO: Add audit log (Day 10)
        }

    }
}
