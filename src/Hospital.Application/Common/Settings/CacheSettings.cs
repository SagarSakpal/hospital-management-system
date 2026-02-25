namespace Hospital.Application.Common.Settings
{
    public class CacheSettings
    {
        // Seconds-to-live for lookups
        public int SpecializationsTtlSeconds { get; set; } = 600; // 10 minutes
        public int DoctorsLiteTtlSeconds { get; set; } = 300;     // 5 minutes
    }
}
