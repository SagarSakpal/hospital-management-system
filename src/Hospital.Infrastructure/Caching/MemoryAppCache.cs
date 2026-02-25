using System;
using System.Threading;
using System.Threading.Tasks;
using Hospital.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace Hospital.Infrastructure.Caching
{
    public class MemoryAppCache : IAppCache
    {
        private readonly IMemoryCache _cache;

        public MemoryAppCache(IMemoryCache cache)
        {
            _cache = cache;
        }

        public async Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan ttl, CancellationToken ct = default)
        {
            if (_cache.TryGetValue(key, out T value))
                return value!;

            var created = await factory(ct);
            _cache.Set(key, created, ttl);
            return created;
        }

        public void Remove(string key) => _cache.Remove(key);
    }
}
