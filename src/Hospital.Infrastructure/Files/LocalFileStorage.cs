using Hospital.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Hospital.Infrastructure.Files
{
    public class LocalFileStorage : IFileStorage
    {
        private readonly string _webRootPath;
        private readonly string _baseUrl; // optional if you want to prefix with host

        public LocalFileStorage(IConfiguration config)
        {
            _webRootPath = config["App:WebRootPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            Directory.CreateDirectory(_webRootPath);
            _baseUrl = config["App:PublicBaseUrl"] ?? string.Empty; // e.g., https://localhost:5001
        }

        public async Task<string> SaveAsync(Stream stream, string subPath, string contentType, CancellationToken ct = default)
        {
            var fullPath = Path.Combine(_webRootPath, subPath.Replace('/', Path.DirectorySeparatorChar));
            var dir = Path.GetDirectoryName(fullPath)!;
            Directory.CreateDirectory(dir);

            using (var file = File.Create(fullPath))
            {
                await stream.CopyToAsync(file, ct);
            }

            return subPath.Replace('\\', '/'); // normalize
        }

        public Task DeleteAsync(string relativePath, CancellationToken ct = default)
        {
            var fullPath = Path.Combine(_webRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
            return Task.CompletedTask;
        }

        public string ToPublicUrl(string relativePath)
        {
            if (string.IsNullOrWhiteSpace(_baseUrl)) return "/" + relativePath.TrimStart('/');
            return $"{_baseUrl.TrimEnd('/')}/{relativePath.TrimStart('/')}";
        }
    }
}
