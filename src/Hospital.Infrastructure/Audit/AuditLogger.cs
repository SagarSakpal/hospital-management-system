using System.Text.Json;
using Hospital.Application.Common.Interfaces;
using Hospital.Domain.Entities;
using Hospital.Infrastructure.Persistence;

namespace Hospital.Infrastructure.Audit
{
    public class AuditLogger : IAuditLogger
    {
        private readonly ApplicationDbContext _db;

        public AuditLogger(ApplicationDbContext db) { _db = db; }

        public async Task LogAsync(string entityName, int entityId, string action, string performedByUserId, object? before, object? after, CancellationToken ct = default)
        {
            var jsonBefore = before == null ? string.Empty : JsonSerializer.Serialize(before, JsonOptions());
            var jsonAfter = after == null ? string.Empty : JsonSerializer.Serialize(after, JsonOptions());

            var entry = new AuditLog
            {
                EntityName = entityName,
                EntityId = entityId,
                Action = action,
                PerformedByUserId = performedByUserId,
                Timestamp = DateTime.UtcNow,
                BeforeJson = jsonBefore,
                AfterJson = jsonAfter
            };
            _db.AuditLogs.Add(entry);
            await _db.SaveChangesAsync(ct);
        }

        private static JsonSerializerOptions JsonOptions() => new JsonSerializerOptions
        {
            WriteIndented = false,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }
}
