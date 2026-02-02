using AutoMapper;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO;
using Hospital.Domain.Entities;

namespace Hospital.Application.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointments;
        private readonly IDoctorRepository _doctors;
        private readonly IPatientRepository _patients;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public AppointmentService(IAppointmentRepository appointments, IDoctorRepository doctors, IPatientRepository patients, IUnitOfWork uow, IMapper mapper)
        {
            _appointments = appointments;
            _doctors = doctors;
            _patients = patients;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request, string createdByUserId, CancellationToken ct = default)
        {
            // Verify doctor & patient exist
            if (!await _doctors.ExistsAsync(d => d.Id == request.DoctorId, ct))
                throw new NotFoundException(nameof(Doctor), request.DoctorId);

            if (!await _patients.ExistsAsync(p => p.Id == request.PatientId, ct))
                throw new NotFoundException(nameof(Patient), request.PatientId);

            // Enforce 1-hour slot by mapping in AutoMapper (Start + 1 hr)
            var entity = _mapper.Map<Appointment>(request);

            // Conflict detection
            var conflict = await _appointments.HasOverlapAsync(request.DoctorId, entity.StartTime, entity.EndTime, null, ct);
            if (conflict) throw new ConflictException("The selected time slot is not available for this doctor.");

            entity.CreatedAt = DateTime.UtcNow;
            entity.Status = "Scheduled";

            await _appointments.AddAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            // TODO: Audit
            return _mapper.Map<AppointmentDto>(entity);
        }
    }
}
