using Hospital.Application.DTO;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/patients")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _service;

        public PatientsController(IPatientService service)
        {
            _service = service;
        }

        private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";

        [HttpPost]
        [Authorize(Roles = "Admin,Nurse")]
        public async Task<ActionResult<PatientDto>> Create(CreatePatientRequest request, CancellationToken ct)
        {
            var dto = await _service.CreateAsync(request, Actor, ct);
            return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Nurse,Doctor")]
        public async Task<ActionResult<List<PatientDto>>> List(CancellationToken ct)
        {
            return Ok(await _service.ListAsync(ct));
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Nurse,Doctor,Patient")]
        public async Task<ActionResult<PatientDto>> Get(int id, CancellationToken ct)
        {
            return Ok(await _service.GetAsync(id, ct));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Nurse")]
        public async Task<IActionResult> Update(int id, UpdatePatientRequest req, CancellationToken ct)
        {
            await _service.UpdateAsync(id, req, Actor, ct);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id, CancellationToken ct)
        {
            await _service.SoftDeleteAsync(id, Actor, ct);
            return NoContent();
        }
    }
}
