using System.Security.Claims;
using Hospital.Application.DTO.Search;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/search")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _search;

        public SearchController(ISearchService search)
        {
            _search = search;
        }

        private string ActorRole =>
            User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value ?? string.Empty;

        [HttpGet("doctors")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        [ProducesResponseType(typeof(List<DoctorSearchDto>), StatusCodes.Status200OK)]
        public Task<List<DoctorSearchDto>> Doctors([FromQuery] string? name, [FromQuery] int? specializationId, CancellationToken ct)
            => _search.SearchDoctors(name, specializationId, ct);

        [HttpGet("patients")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        [ProducesResponseType(typeof(List<PatientSearchDto>), StatusCodes.Status200OK)]
        public Task<List<PatientSearchDto>> Patients([FromQuery] string? name, [FromQuery] string? condition, CancellationToken ct)
            => _search.SearchPatients(name, condition, ct);

        [HttpGet("records")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        [ProducesResponseType(typeof(List<RecordSearchDto>), StatusCodes.Status200OK)]
        public async Task<List<RecordSearchDto>> Records(
            [FromQuery] int? patientId,
            [FromQuery] int? doctorId,
            [FromQuery] bool includeArchived,
            CancellationToken ct)
        {
            var role = ActorRole;

            // NOTE: When you wire Patients.UserId mapping, enforce:
            // if (role == "Patient") ensure 'patientId' equals the current user's patientId.
            // For now, rely on front-end to pass correct patientId, and harden later.

            return await _search.SearchRecords(patientId, doctorId, includeArchived, ct);
        }
    }
}
