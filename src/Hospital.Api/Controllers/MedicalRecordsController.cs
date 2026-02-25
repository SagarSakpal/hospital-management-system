using System.Security.Claims;
using Hospital.Application.DTO.MedicalRecords;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/medical-records")]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _service;

        public MedicalRecordsController(IMedicalRecordService service)
        {
            _service = service;
        }

        private string ActorUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        private string ActorRole => User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value ?? string.Empty;

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public Task<MedicalRecordDto> Create([FromBody] CreateMedicalRecordRequest req, CancellationToken ct)
            => _service.CreateAsync(req, ActorUserId, ActorRole, ct);

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public Task<MedicalRecordDto> Get(int id, CancellationToken ct)
            => _service.GetAsync(id, ActorUserId, ActorRole, ct);

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public Task<MedicalRecordDto> Update(int id, [FromBody] UpdateMedicalRecordRequest req, CancellationToken ct)
            => _service.UpdateAsync(id, req, ActorUserId, ActorRole, ct);

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<IActionResult> SoftDelete(int id, CancellationToken ct)
        {
            await _service.SoftDeleteAsync(id, ActorUserId, ActorRole, ct);
            return NoContent();
        }

        [HttpPost("{id:int}/archive")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Archive(int id, [FromBody] ArchiveMedicalRecordRequest req, CancellationToken ct)
        {
            await _service.ArchiveAsync(id, req.Archive, ActorUserId, ActorRole, ct);
            return Ok();
        }

        // List endpoints (helpful for UI)
        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public Task<List<MedicalRecordDto>> ListAll([FromQuery] bool includeArchived, CancellationToken ct)
            => _service.ListAllAsync(includeArchived, ActorUserId, ActorRole, ct);

        [HttpGet("patient/{patientId:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public Task<List<MedicalRecordDto>> ListByPatient(int patientId, [FromQuery] bool includeArchived, CancellationToken ct)
            => _service.ListByPatientAsync(patientId, includeArchived, ActorUserId, ActorRole, ct);

        [HttpGet("doctor/{doctorId:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public Task<List<MedicalRecordDto>> ListByDoctor(int doctorId, [FromQuery] bool includeArchived, CancellationToken ct)
            => _service.ListByDoctorAsync(doctorId, includeArchived, ActorUserId, ActorRole, ct);

        // Attachment upload (multipart/form-data)
        [HttpPost("{id:int}/attachment")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        [RequestSizeLimit(50_000_000)] // 50 MB dev cap
        public async Task<ActionResult<string>> Upload(int id, IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ProblemDetails { Detail = "No file provided." });

            using var stream = file.OpenReadStream();
            var url = await _service.UploadAttachmentAsync(id, file.FileName, file.ContentType, stream, ActorUserId, ActorRole, ct);
            return Ok(url);
        }

        [HttpGet("{id:int}/attachment")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> DownloadAttachment(int id, CancellationToken ct)
        {
            var record = await _service.GetAsync(id, ActorUserId, ActorRole, ct);
            if (string.IsNullOrEmpty(record.AttachmentUrl))
                return NotFound(new ProblemDetails { Detail = "No attachment found." });

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", record.AttachmentUrl.TrimStart('/'));
            if (!System.IO.File.Exists(filePath))
                return NotFound(new ProblemDetails { Detail = "File not found on server." });

            var fileName = Path.GetFileName(filePath);
            var mimeType = "application/octet-stream";
            if (fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                mimeType = "application/pdf";

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath, ct);
            return File(fileBytes, mimeType, fileName);
        }
    }
}

