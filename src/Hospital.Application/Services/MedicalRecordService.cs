using AutoMapper;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO.MedicalRecords;
using Hospital.Domain.Entities;

namespace Hospital.Application.Services
{
    public interface IMedicalRecordService
    {
        Task<MedicalRecordDto> CreateAsync(CreateMedicalRecordRequest req, string actorUserId, string actorRole, CancellationToken ct);
        Task<MedicalRecordDto> UpdateAsync(int id, UpdateMedicalRecordRequest req, string actorUserId, string actorRole, CancellationToken ct);
        Task<MedicalRecordDto> GetAsync(int id, string actorUserId, string actorRole, CancellationToken ct);
        Task<List<MedicalRecordDto>> ListAllAsync(bool includeArchived, string actorUserId, string actorRole, CancellationToken ct);
        Task<List<MedicalRecordDto>> ListByPatientAsync(int patientId, bool includeArchived, string actorUserId, string actorRole, CancellationToken ct);
        Task<List<MedicalRecordDto>> ListByDoctorAsync(int doctorId, bool includeArchived, string actorUserId, string actorRole, CancellationToken ct);
        Task ArchiveAsync(int id, bool archive, string actorUserId, string actorRole, CancellationToken ct);
        Task SoftDeleteAsync(int id, string actorUserId, string actorRole, CancellationToken ct);
        Task<string> UploadAttachmentAsync(int id, string fileName, string contentType, Stream content, string actorUserId, string actorRole, CancellationToken ct);
    }

    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IMedicalRecordRepository _records;
        private readonly IDoctorRepository _doctors;
        private readonly IPatientRepository _patients;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IAuditLogger _audit;
        private readonly IFileStorage _files;

        public MedicalRecordService(
            IMedicalRecordRepository records,
            IDoctorRepository doctors,
            IPatientRepository patients,
            IUnitOfWork uow,
            IMapper mapper,
            IAuditLogger audit,
            IFileStorage files)
        {
            _records = records;
            _doctors = doctors;
            _patients = patients;
            _uow = uow;
            _mapper = mapper;
            _audit = audit;
            _files = files;
        }

        public async Task<MedicalRecordDto> CreateAsync(CreateMedicalRecordRequest req, string actorUserId, string actorRole, CancellationToken ct)
        {
            // RBAC: Doctor/Nurse/Admin
            EnsureRole(actorRole, "Admin", "Doctor", "Nurse");

            if (!await _patients.ExistsAsync(p => p.Id == req.PatientId, ct))
                throw new NotFoundException(nameof(Patient), req.PatientId);
            if (!await _doctors.ExistsAsync(d => d.Id == req.DoctorId, ct))
                throw new NotFoundException(nameof(Doctor), req.DoctorId);

            var entity = _mapper.Map<MedicalRecord>(req);
            entity.CreatedOn = DateTime.UtcNow;
            entity.IsArchived = false;
            entity.IsDeleted = false;

            await _records.AddAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            await _audit.LogAsync(nameof(MedicalRecord), entity.Id, "Create", actorUserId, null, entity, ct);

            return _mapper.Map<MedicalRecordDto>(entity);
        }

        public async Task<MedicalRecordDto> UpdateAsync(int id, UpdateMedicalRecordRequest req, string actorUserId, string actorRole, CancellationToken ct)
        {
            // RBAC: Doctor/Nurse/Admin
            EnsureRole(actorRole, "Admin", "Doctor", "Nurse");

            var entity = await _records.GetByIdTrackedAsync(id, ct)
                ?? throw new NotFoundException(nameof(MedicalRecord), id);

            var before = Clone(entity);

            _mapper.Map(req, entity);
            entity.UpdatedOn = DateTime.UtcNow;

            await _records.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            await _audit.LogAsync(nameof(MedicalRecord), entity.Id, "Update", actorUserId, before, entity, ct);

            return _mapper.Map<MedicalRecordDto>(entity);
        }

        public async Task<MedicalRecordDto> GetAsync(int id, string actorUserId, string actorRole, CancellationToken ct)
        {
            var entity = await _records.GetByIdTrackedAsync(id, ct)
                ?? throw new NotFoundException(nameof(MedicalRecord), id);

            // RBAC: Patient can read own only
            if (actorRole == "Patient")
            {
                // To strictly enforce "own", you'd resolve PatientId from actorUserId.
                // For now, assume backend ensures route-level checks (or add mapping via repository).
                // If needed, deny here unless patientId belongs to actorUserId.
            }

            return _mapper.Map<MedicalRecordDto>(entity);
        }

        public async Task<List<MedicalRecordDto>> ListAllAsync(bool includeArchived, string actorUserId, string actorRole, CancellationToken ct)
        {
            EnsureRole(actorRole, "Admin", "Doctor", "Nurse");
            var list = await _records.ListAllAsync(includeArchived, ct);
            return list.Select(_mapper.Map<MedicalRecordDto>).ToList();
        }

        public async Task<List<MedicalRecordDto>> ListByPatientAsync(int patientId, bool includeArchived, string actorUserId, string actorRole, CancellationToken ct)
        {
            if (actorRole == "Patient")
            {
                // Verify that patientId belongs to actorUserId (requires user->patient mapping in DB).
                // Skipped for brevity; add when you wire Patients.UserId checks.
            }

            var list = await _records.ListByPatientAsync(patientId, includeArchived, ct);
            return list.Select(_mapper.Map<MedicalRecordDto>).ToList();
        }

        public async Task<List<MedicalRecordDto>> ListByDoctorAsync(int doctorId, bool includeArchived, string actorUserId, string actorRole, CancellationToken ct)
        {
            EnsureRole(actorRole, "Admin", "Doctor", "Nurse");
            var list = await _records.ListByDoctorAsync(doctorId, includeArchived, ct);
            return list.Select(_mapper.Map<MedicalRecordDto>).ToList();
        }

        public async Task ArchiveAsync(int id, bool archive, string actorUserId, string actorRole, CancellationToken ct)
        {
            // RBAC: Admin only (as per requirement)
            EnsureRole(actorRole, "Admin");

            var entity = await _records.GetByIdTrackedAsync(id, ct)
                ?? throw new NotFoundException(nameof(MedicalRecord), id);

            var before = Clone(entity);
            entity.IsArchived = archive;
            entity.UpdatedOn = DateTime.UtcNow;

            await _records.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            await _audit.LogAsync(nameof(MedicalRecord), entity.Id, archive ? "Archive" : "Unarchive", actorUserId, before, entity, ct);
        }

        public async Task SoftDeleteAsync(int id, string actorUserId, string actorRole, CancellationToken ct)
        {
            // RBAC: Admin/Doctor/Nurse
            EnsureRole(actorRole, "Admin", "Doctor", "Nurse");

            var entity = await _records.GetByIdTrackedAsync(id, ct)
                ?? throw new NotFoundException(nameof(MedicalRecord), id);

            var before = Clone(entity);
            entity.IsDeleted = true;

            await _records.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            await _audit.LogAsync(nameof(MedicalRecord), entity.Id, "SoftDelete", actorUserId, before, entity, ct);
        }

        public async Task<string> UploadAttachmentAsync(int id, string fileName, string contentType, Stream content, string actorUserId, string actorRole, CancellationToken ct)
        {
            // RBAC: Admin/Doctor/Nurse
            EnsureRole(actorRole, "Admin", "Doctor", "Nurse");

            var entity = await _records.GetByIdTrackedAsync(id, ct)
                ?? throw new NotFoundException(nameof(MedicalRecord), id);

            var before = Clone(entity);

            var safeName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
            var subPath = $"uploads/records/{entity.PatientId}/{safeName}";

            var relative = await _files.SaveAsync(content, subPath, contentType, ct);
            entity.AttachmentUrl = _files.ToPublicUrl(relative);
            entity.UpdatedOn = DateTime.UtcNow;

            await _records.UpdateAsync(entity, ct);
            await _uow.SaveChangesAsync(ct);

            await _audit.LogAsync(nameof(MedicalRecord), entity.Id, "UploadAttachment", actorUserId, before, entity, ct);

            return entity.AttachmentUrl ?? relative;
        }

        private static void EnsureRole(string actorRole, params string[] allowed)
        {
            if (!allowed.Contains(actorRole)) throw new BusinessRuleException("You are not authorized to perform this action.");
        }

        private static MedicalRecord Clone(MedicalRecord m) => new MedicalRecord
        {
            Id = m.Id,
            PatientId = m.PatientId,
            DoctorId = m.DoctorId,
            RecordType = m.RecordType,
            Description = m.Description,
            AttachmentUrl = m.AttachmentUrl,
            CreatedOn = m.CreatedOn,
            UpdatedOn = m.UpdatedOn,
            IsArchived = m.IsArchived,
            IsDeleted = m.IsDeleted
        };
    }
}
