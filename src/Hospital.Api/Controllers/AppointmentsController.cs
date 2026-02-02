using Hospital.Application.DTO;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/appointments")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentsController(IAppointmentService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<AppointmentDto>> Create([FromBody] CreateAppointmentRequest request, CancellationToken ct)
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "system";
            var dto = await _service.CreateAsync(request, userId, ct);
            return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
        }

        // Minimal "Get" stub so CreatedAtAction compiles; you can complete later
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public IActionResult Get(int id) => Ok();
    }
}
