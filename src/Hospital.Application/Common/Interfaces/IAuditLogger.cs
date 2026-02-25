namespace Hospital.Application.Common.Interfaces
{
    public interface IAuditLogger
    {
        Task LogAsync(string entityName, int entityId, string action, string performedByUserId, object? before, object? after, CancellationToken ct = default);
    }
}
