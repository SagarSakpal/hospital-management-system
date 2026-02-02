using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO.DoctorPatient;
using Hospital.Domain.Entities;

namespace Hospital.Application.Services
{
    public interface IDoctorPatientService
    {
        Task AssignAsync(int doctorId, int patientId, string actor, CancellationToken ct = default);
        Task UnassignAsync(int doctorId, int patientId, string actor, CancellationToken ct = default);
        Task<System.Collections.Generic.List<DoctorPatientDto>> GetPatientsForDoctorAsync(int doctorId, CancellationToken ct = default);
        Task<System.Collections.Generic.List<DoctorPatientDto>> GetDoctorsForPatientAsync(int patientId, CancellationToken ct = default);
    }

    /// <summary>
    /// Handles the lifecycle of Doctor–Patient relationships (assign, unassign, list).
    /// Applies business rules like preventing duplicate active assignments.
    /// </summary>
    public class DoctorPatientService : IDoctorPatientService
    {
        private readonly IDoctorRepository _doctors;
        private readonly IPatientRepository _patients;
        private readonly IDoctorPatientRepository _doctorPatients;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public DoctorPatientService(
            IDoctorRepository doctors,
            IPatientRepository patients,
            IDoctorPatientRepository doctorPatients,
            IUnitOfWork uow,
            IMapper mapper)
        {
            _doctors = doctors;
            _patients = patients;
            _doctorPatients = doctorPatients;
            _uow = uow;
            _mapper = mapper;
        }

        /// <summary>
        /// Assigns a patient to a doctor. If the pair already has an active link, throws BusinessRuleException.
        /// </summary>
        public async Task AssignAsync(int doctorId, int patientId, string actor, CancellationToken ct = default)
        {
            // Ensure doctor and patient exist (soft-delete filters already applied in EF global filters)
            if (!await _doctors.ExistsAsync(d => d.Id == doctorId, ct))
                throw new NotFoundException(nameof(Doctor), doctorId);

            if (!await _patients.ExistsAsync(p => p.Id == patientId, ct))
                throw new NotFoundException(nameof(Patient), patientId);

            // Prevent duplicate active assignment for the same pair
            var alreadyActive = await _doctorPatients.ExistsAsync(
                x => x.DoctorId == doctorId && x.PatientId == patientId && x.IsActive, ct);

            if (alreadyActive)
                throw new BusinessRuleException("Patient is already assigned to this doctor.");

            var link = new DoctorPatient
            {
                DoctorId = doctorId,
                PatientId = patientId,
                IsActive = true
            };

            await _doctorPatients.AddAsync(link, ct);
            await _uow.SaveChangesAsync(ct);

            // TODO (Day 10): Audit log (Action=Assign)
        }

        /// <summary>
        /// Unassigns (deactivates) the relation between a doctor and a patient.
        /// If no active relation exists, throws NotFoundException.
        /// </summary>
        public async Task UnassignAsync(int doctorId, int patientId, string actor, CancellationToken ct = default)
        {
            var activeList = await _doctorPatients.ListAsync(
                x => x.DoctorId == doctorId && x.PatientId == patientId && x.IsActive, ct);

            var active = activeList.FirstOrDefault();
            if (active == null)
                throw new NotFoundException("DoctorPatient", $"{doctorId}-{patientId}");

            active.IsActive = false;
            await _doctorPatients.UpdateAsync(active, ct);
            await _uow.SaveChangesAsync(ct);

            // TODO (Day 10): Audit log (Action=Unassign)
        }

        /// <summary>
        /// Returns active patient links for a given doctor (link-level DTO).
        /// </summary>
        public async Task<System.Collections.Generic.List<DoctorPatientDto>> GetPatientsForDoctorAsync(int doctorId, CancellationToken ct = default)
        {
            // Ensure doctor exists (optional, but gives clearer 404 if not)
            if (!await _doctors.ExistsAsync(d => d.Id == doctorId, ct))
                throw new NotFoundException(nameof(Doctor), doctorId);

            var links = await _doctorPatients.GetActiveByDoctorAsync(doctorId, ct);
            return links.Select(dp => _mapper.Map<DoctorPatientDto>(dp)).ToList();
        }

        /// <summary>
        /// Returns active doctor links for a given patient (link-level DTO).
        /// </summary>
        public async Task<System.Collections.Generic.List<DoctorPatientDto>> GetDoctorsForPatientAsync(int patientId, CancellationToken ct = default)
        {
            // Ensure patient exists (optional, but gives clearer 404 if not)
            if (!await _patients.ExistsAsync(p => p.Id == patientId, ct))
                throw new NotFoundException(nameof(Patient), patientId);

            var links = await _doctorPatients.GetActiveByPatientAsync(patientId, ct);
            return links.Select(dp => _mapper.Map<DoctorPatientDto>(dp)).ToList();
        }
    }
}
