using Hospital.Application.DTO;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AutoMapper;
using Hospital.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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

        private string CurrentUserId
        {
            get
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                    throw new UnauthorizedAccessException("User ID not found in claims.");
                return userId;
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<AppointmentDto>> Create(CreateAppointmentRequest req, CancellationToken ct)
        {
            var dto = await _service.CreateAsync(req, CurrentUserId, ct);
            return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]
        public async Task<ActionResult<List<AppointmentDto>>> GetAll(CancellationToken ct)
        {
            var appointments = await _service.GetAllAsync(ct);
            return Ok(appointments);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<AppointmentDto>> Get(int id, CancellationToken ct)
        {
            var appointment = await _service.GetByIdAsync(id, ct);
            if (appointment == null)
                return NotFound();

            return Ok(appointment);
        }

        // GET /api/v1/appointments/doctor/{doctorId}?from=YYYY-MM-DD&to=YYYY-MM-DD
        [HttpGet("doctor/{doctorId:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<List<AppointmentDto>>> GetDoctorRange(
            int doctorId, [FromQuery] DateTime from, [FromQuery] DateTime to,
            [FromServices] IMapper mapper, [FromServices] ApplicationDbContext db, CancellationToken ct)
        {
            var start = DateTime.SpecifyKind(from.Date, DateTimeKind.Utc);
            var end = DateTime.SpecifyKind(to.Date, DateTimeKind.Utc).AddDays(1);

            var list = await db.Appointments.AsNoTracking()
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.DoctorId == doctorId && a.StartTime >= start && a.StartTime < end)
                .OrderBy(a => a.StartTime)
                .ToListAsync(ct);

            return Ok(list.Select(mapper.Map<AppointmentDto>).ToList());
        }

        // GET /api/v1/appointments/patient/{patientId}?from=YYYY-MM-DD&to=YYYY-MM-DD
        [HttpGet("patient/{patientId:int}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<List<AppointmentDto>>> GetPatientRange(
            int patientId, [FromQuery] DateTime from, [FromQuery] DateTime to,
            [FromServices] IMapper mapper, [FromServices] ApplicationDbContext db, CancellationToken ct)
        {
            var start = DateTime.SpecifyKind(from.Date, DateTimeKind.Utc);
            var end = DateTime.SpecifyKind(to.Date, DateTimeKind.Utc).AddDays(1);

            var list = await db.Appointments.AsNoTracking()
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.PatientId == patientId && a.StartTime >= start && a.StartTime < end)
                .OrderBy(a => a.StartTime)
                .ToListAsync(ct);

            return Ok(list.Select(mapper.Map<AppointmentDto>).ToList());
        }

        public class UpdateAppointmentStatusRequest { public string Status { get; set; } = default!; }

// PATCH /api/v1/appointments/{id}/status
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<ActionResult<AppointmentDto>> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusRequest req,
            [FromServices] ApplicationDbContext db, [FromServices] IMapper mapper, CancellationToken ct)
        {
            var appt = await db.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.Id == id, ct);
            if (appt == null) return NotFound();

            // Allow transition only from Scheduled -> Cancelled/Completed
            if (appt.Status != "Scheduled")
                return BadRequest(new ProblemDetails { Detail = "Only Scheduled appointments can change status." });

            if (req.Status != "Cancelled" && req.Status != "Completed")
                return BadRequest(new ProblemDetails { Detail = "Invalid status." });

            appt.Status = req.Status;
            await db.SaveChangesAsync(ct);
            return Ok(mapper.Map<AppointmentDto>(appt));
        }
    }
}
