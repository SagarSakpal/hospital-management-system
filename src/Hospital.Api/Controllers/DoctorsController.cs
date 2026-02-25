using Hospital.Application.DTO;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/doctors")]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _service;

        public DoctorsController(IDoctorService service)
        {
            _service = service;
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<DoctorDto>> Get(int id, CancellationToken ct)
        {
            var dto = await _service.GetAsync(id, ct);
            return Ok(dto);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<List<DoctorDto>>> List(CancellationToken ct)
        {
            var list = await _service.ListAsync(ct);
            return Ok(list);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DoctorDto>> Create([FromBody] CreateDoctorRequest request, CancellationToken ct)
        {
            // You’d take userId from claims in a real scenario:
            var performedBy = User?.Identity?.Name ?? "system";
            var result = await _service.CreateAsync(request, performedBy, ct);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorRequest request, CancellationToken ct)
        {
            var performedBy = User?.Identity?.Name ?? "system";
            await _service.UpdateAsync(id, request, performedBy, ct);
            return NoContent();
        }

        [HttpPatch("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Patch(int id, [FromBody] PatchDoctorRequest request, CancellationToken ct)
        {
            var performedBy = User?.Identity?.Name ?? "system";
            await _service.PatchAsync(id, request, performedBy, ct);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id, CancellationToken ct)
        {
            var performedBy = User?.Identity?.Name ?? "system";
            await _service.SoftDeleteAsync(id, performedBy, ct);
            return NoContent();
        }
    }
}
