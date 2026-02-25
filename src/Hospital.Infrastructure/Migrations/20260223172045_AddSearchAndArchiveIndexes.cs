using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hospital.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchAndArchiveIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // MedicalRecords for archive/search:
            // Filter by Patient/Doctor + IsArchived + CreatedOn
            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PatientId_IsArchived_CreatedOn",
                table: "MedicalRecords",
                columns: new[] { "PatientId", "IsArchived", "CreatedOn" });

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_DoctorId_IsArchived_CreatedOn",
                table: "MedicalRecords",
                columns: new[] { "DoctorId", "IsArchived", "CreatedOn" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex("IX_MedicalRecords_PatientId_IsArchived_CreatedOn", "MedicalRecords");
            migrationBuilder.DropIndex("IX_MedicalRecords_DoctorId_IsArchived_CreatedOn", "MedicalRecords");
        }
    }
}
