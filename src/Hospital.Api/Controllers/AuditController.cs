using Hospital.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/audit")]
    public class AuditController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AuditController(ApplicationDbContext db) { _db = db; }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get([FromQuery] string entity, [FromQuery] int entityId, CancellationToken ct)
        {
            var list = await _db.AuditLogs.AsNoTracking()
                .Where(a => a.EntityName == entity && a.EntityId == entityId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync(ct);
            return Ok(list);
        }
    }
}
