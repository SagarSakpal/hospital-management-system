namespace Hospital.Application.Common.Interfaces
{
    public interface IFileStorage
    {
        /// <summary>Saves the stream under the given subPath (e.g., "uploads/records/123/filename.ext"). Returns the relative path saved.</summary>
        Task<string> SaveAsync(Stream stream, string subPath, string contentType, CancellationToken ct = default);

        /// <summary>Deletes a previously saved relative path (if exists).</summary>
        Task DeleteAsync(string relativePath, CancellationToken ct = default);

        /// <summary>Builds a public URL (for static file hosting) from a relative path.</summary>
        string ToPublicUrl(string relativePath);
    }
}
