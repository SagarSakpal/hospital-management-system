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

        public AppointmentService(
            IAppointmentRepository appointments,
            IDoctorRepository doctors,
            IPatientRepository patients,
            IUnitOfWork uow,
            IMapper mapper)
        {
            _appointments = appointments;
            _doctors = doctors;
            _patients = patients;
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request, string actorUserId, CancellationToken ct)
        {
            // Validate actorUserId
            if (string.IsNullOrWhiteSpace(actorUserId))
                throw new BusinessRuleException("Invalid or missing user authentication.");

            // Check doctor & patient exist
            if (!await _doctors.ExistsAsync(d => d.Id == request.DoctorId, ct))
                throw new NotFoundException(nameof(Doctor), request.DoctorId);

            if (!await _patients.ExistsAsync(p => p.Id == request.PatientId, ct))
                throw new NotFoundException(nameof(Patient), request.PatientId);

            // Map to entity (EndTime is auto-added by AutoMapper)
            var entity = _mapper.Map<Appointment>(request);

            // Conflict detection
            bool hasConflict = await _appointments.HasOverlapAsync(
                request.DoctorId, entity.StartTime, entity.EndTime, null, ct);

            if (hasConflict)
                throw new ConflictException("The selected time slot is already booked for this doctor.");

            entity.Status = "Scheduled";
            entity.CreatedByUserId = actorUserId;
            entity.CreatedAt = DateTime.UtcNow;

            await _appointments.AddAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            return _mapper.Map<AppointmentDto>(entity);
        }

        public async Task<AppointmentDto?> GetByIdAsync(int id, CancellationToken ct)
        {
            var appointment = await _appointments.GetByIdAsync(id, ct);
            if (appointment == null)
                return null;

            return _mapper.Map<AppointmentDto>(appointment);
        }

        public async Task<List<AppointmentDto>> GetAllAsync(CancellationToken ct)
        {
            var appointments = await _appointments.ListAsync(null, ct);
            return _mapper.Map<List<AppointmentDto>>(appointments);
        }
    }
}
