using Hospital.Application.DTO.DoctorPatient;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/relationships")]
    public class DoctorPatientController : ControllerBase
    {
        private readonly IDoctorPatientService _service;

        public DoctorPatientController(IDoctorPatientService service)
        {
            _service = service;
        }

        private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";

        [HttpPost("assign")]
        [Authorize(Roles = "Admin,Nurse")]
        public async Task<IActionResult> Assign([FromBody] AssignPatientRequest req, CancellationToken ct)
        {
            await _service.AssignAsync(req.DoctorId, req.PatientId, Actor, ct);
            return Ok(new { message = "Assigned successfully." });
        }

        [HttpPost("unassign")]
        [Authorize(Roles = "Admin,Nurse")]
        public async Task<IActionResult> Unassign([FromBody] UnassignPatientRequest req, CancellationToken ct)
        {
            await _service.UnassignAsync(req.DoctorId, req.PatientId, Actor, ct);
            return Ok(new { message = "Unassigned successfully." });
        }

        [HttpGet("doctor/{doctorId}/patients")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public Task<List<DoctorPatientDto>> GetPatients(int doctorId, CancellationToken ct)
            => _service.GetPatientsForDoctorAsync(doctorId, ct);

        [HttpGet("patient/{patientId}/doctors")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public Task<List<DoctorPatientDto>> GetDoctors(int patientId, CancellationToken ct)
            => _service.GetDoctorsForPatientAsync(patientId, ct);
    }
}
