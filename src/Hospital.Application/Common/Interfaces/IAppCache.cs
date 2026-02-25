using System;
using System.Threading;
using System.Threading.Tasks;

namespace Hospital.Application.Common.Interfaces
{
    public interface IAppCache
    {
        Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken ct = default);
        void Remove(string key);
    }
}
