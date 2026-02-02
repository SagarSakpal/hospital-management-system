using AutoMapper;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO;
using Hospital.Domain.Entities;

namespace Hospital.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patients;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public PatientService(IPatientRepository patients, IUnitOfWork uow, IMapper mapper)
        {
            _patients = patients;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<PatientDto> CreateAsync(CreatePatientRequest request, string actor, CancellationToken ct)
        {
            var entity = _mapper.Map<Patient>(request);
            await _patients.AddAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);
            return _mapper.Map<PatientDto>(entity);
        }

        public async Task<List<PatientDto>> ListAsync(CancellationToken ct)
        {
            var list = await _patients.ListAsync(null, ct);
            return list.Select(p => _mapper.Map<PatientDto>(p)).ToList();
        }

        public async Task<PatientDto> GetAsync(int id, CancellationToken ct)
        {
            var entity = await _patients.GetByIdAsync(id, ct)
                ?? throw new NotFoundException(nameof(Patient), id);

            return _mapper.Map<PatientDto>(entity);
        }

        public async Task UpdateAsync(int id, UpdatePatientRequest request, string actor, CancellationToken ct)
        {
            var entity = await _patients.GetByIdAsync(id, ct)
                ?? throw new NotFoundException(nameof(Patient), id);

            _mapper.Map(request, entity);

            await _patients.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);
        }

        public async Task SoftDeleteAsync(int id, string actor, CancellationToken ct)
        {
            var entity = await _patients.GetByIdAsync(id, ct)
                ?? throw new NotFoundException(nameof(Patient), id);

            entity.IsDeleted = true;

            await _patients.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
