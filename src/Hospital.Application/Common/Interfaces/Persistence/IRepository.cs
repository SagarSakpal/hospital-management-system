namespace Hospital.Application.Common.Interfaces.Persistence
{
    public interface IRepository<T> : IReadOnlyRepository<T> where T : class
    {
        Task<T> AddAsync(T entity, CancellationToken ct = default);
        Task UpdateAsync(T entity, CancellationToken ct = default);
        Task DeleteAsync(T entity, CancellationToken ct = default);
    }
}
