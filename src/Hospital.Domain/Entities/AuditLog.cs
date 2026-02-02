namespace Hospital.Domain.Entities;

public class AuditLog
{

    public int Id { get; set; }

    public string EntityName { get; set; } = default!;       // e.g., "MedicalRecord"
    public int EntityId { get; set; }

    public string Action { get; set; } = default!;           // e.g., "Create", "Update", "Delete", "Archive"
    public string PerformedByUserId { get; set; } = default!;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string BeforeJson { get; set; } = default!;
    public string AfterJson { get; set; } = default!;

}
