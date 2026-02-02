using System.Linq.Expressions;

namespace Hospital.Application.Common.Interfaces.Persistence
{
    public interface IReadOnlyRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
        Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>>? predicate = null,
            CancellationToken ct = default);
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    }
}

