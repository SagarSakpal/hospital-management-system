using AutoMapper;
using FluentAssertions;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO.MedicalRecords;
using Hospital.Application.Services;
using Hospital.Domain.Entities;
using Moq;
using System.Linq.Expressions;

namespace Hospital.UnitTests.Services;

public class MedicalRecordServiceTests
{
    private readonly Mock<IMedicalRecordRepository> _recordRepositoryMock;
    private readonly Mock<IDoctorRepository> _doctorRepositoryMock;
    private readonly Mock<IPatientRepository> _patientRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<IAuditLogger> _auditLoggerMock;
    private readonly Mock<IFileStorage> _fileStorageMock;
    private readonly MedicalRecordService _sut;

    public MedicalRecordServiceTests()
    {
        _recordRepositoryMock = new Mock<IMedicalRecordRepository>();
        _doctorRepositoryMock = new Mock<IDoctorRepository>();
        _patientRepositoryMock = new Mock<IPatientRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _auditLoggerMock = new Mock<IAuditLogger>();
        _fileStorageMock = new Mock<IFileStorage>();

        _sut = new MedicalRecordService(
            _recordRepositoryMock.Object,
            _doctorRepositoryMock.Object,
            _patientRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _mapperMock.Object,
            _auditLoggerMock.Object,
            _fileStorageMock.Object);
    }

    #region CreateAsync Tests

    [Theory]
    [InlineData("Admin")]
    [InlineData("Doctor")]
    [InlineData("Nurse")]
    public async Task CreateAsync_WithAuthorizedRole_ShouldCreateRecordSuccessfully(string role)
    {
        // Arrange
        var request = new CreateMedicalRecordRequest
        {
            PatientId = 1,
            DoctorId = 2,
            RecordType = "Diagnosis",
            Description = "Test description"
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        var record = new MedicalRecord { Id = 1 };
        var recordDto = new MedicalRecordDto { Id = 1 };

        _patientRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Patient, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _doctorRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Doctor, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _mapperMock.Setup(m => m.Map<MedicalRecord>(request)).Returns(record);
        _mapperMock.Setup(m => m.Map<MedicalRecordDto>(record)).Returns(recordDto);
        _recordRepositoryMock.Setup(r => r.AddAsync(record, cancellationToken))
            .ReturnsAsync(record);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);
        _auditLoggerMock.Setup(a => a.LogAsync(
            It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _sut.CreateAsync(request, actorUserId, role, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        record.CreatedOn.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        record.IsArchived.Should().BeFalse();
        record.IsDeleted.Should().BeFalse();

        _auditLoggerMock.Verify(a => a.LogAsync(
            nameof(MedicalRecord), 1, "Create", actorUserId, null, record, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithUnauthorizedRole_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var request = new CreateMedicalRecordRequest
        {
            PatientId = 1,
            DoctorId = 2,
            RecordType = "Diagnosis"
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.CreateAsync(request, actorUserId, "Patient", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*not authorized*");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentPatient_ShouldThrowNotFoundException()
    {
        // Arrange
        var request = new CreateMedicalRecordRequest
        {
            PatientId = 999,
            DoctorId = 2,
            RecordType = "Diagnosis"
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        _patientRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Patient, bool>>>(), cancellationToken))
            .ReturnsAsync(false);

        // Act
        var act = async () => await _sut.CreateAsync(request, actorUserId, "Admin", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Patient)}*999*");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentDoctor_ShouldThrowNotFoundException()
    {
        // Arrange
        var request = new CreateMedicalRecordRequest
        {
            PatientId = 1,
            DoctorId = 999,
            RecordType = "Diagnosis"
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        _patientRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Patient, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _doctorRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Doctor, bool>>>(), cancellationToken))
            .ReturnsAsync(false);

        // Act
        var act = async () => await _sut.CreateAsync(request, actorUserId, "Admin", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Doctor)}*999*");
    }

    #endregion

    #region UpdateAsync Tests

    [Theory]
    [InlineData("Admin")]
    [InlineData("Doctor")]
    [InlineData("Nurse")]
    public async Task UpdateAsync_WithAuthorizedRole_ShouldUpdateRecordSuccessfully(string role)
    {
        // Arrange
        var recordId = 1;
        var request = new UpdateMedicalRecordRequest
        {
            RecordType = "Updated Type",
            Description = "Updated description"
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        var existingRecord = new MedicalRecord
        {
            Id = recordId,
            RecordType = "Old Type",
            Description = "Old description"
        };
        var recordDto = new MedicalRecordDto { Id = recordId };

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync(existingRecord);
        _mapperMock.Setup(m => m.Map(request, existingRecord)).Verifiable();
        _mapperMock.Setup(m => m.Map<MedicalRecordDto>(existingRecord)).Returns(recordDto);
        _recordRepositoryMock.Setup(r => r.UpdateAsync(existingRecord, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);
        _auditLoggerMock.Setup(a => a.LogAsync(
            It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _sut.UpdateAsync(recordId, request, actorUserId, role, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        existingRecord.UpdatedOn.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        
        _auditLoggerMock.Verify(a => a.LogAsync(
            nameof(MedicalRecord), recordId, "Update", actorUserId, 
            It.IsAny<object>(), existingRecord, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithUnauthorizedRole_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var recordId = 1;
        var request = new UpdateMedicalRecordRequest();
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.UpdateAsync(recordId, request, actorUserId, "Patient", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*not authorized*");
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentRecord_ShouldThrowNotFoundException()
    {
        // Arrange
        var recordId = 999;
        var request = new UpdateMedicalRecordRequest();
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync((MedicalRecord?)null);

        // Act
        var act = async () => await _sut.UpdateAsync(recordId, request, actorUserId, "Admin", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(MedicalRecord)}*999*");
    }

    #endregion

    #region GetAsync Tests

    [Fact]
    public async Task GetAsync_WithValidId_ShouldReturnRecord()
    {
        // Arrange
        var recordId = 1;
        var cancellationToken = CancellationToken.None;
        var record = new MedicalRecord { Id = recordId };
        var recordDto = new MedicalRecordDto { Id = recordId };

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync(record);
        _mapperMock.Setup(m => m.Map<MedicalRecordDto>(record)).Returns(recordDto);

        // Act
        var result = await _sut.GetAsync(recordId, "user123", "Doctor", cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(recordId);
    }

    [Fact]
    public async Task GetAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var recordId = 999;
        var cancellationToken = CancellationToken.None;

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync((MedicalRecord?)null);

        // Act
        var act = async () => await _sut.GetAsync(recordId, "user123", "Doctor", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(MedicalRecord)}*999*");
    }

    #endregion

    #region ListAllAsync Tests

    [Theory]
    [InlineData("Admin")]
    [InlineData("Doctor")]
    [InlineData("Nurse")]
    public async Task ListAllAsync_WithAuthorizedRole_ShouldReturnAllRecords(string role)
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        var records = new List<MedicalRecord>
        {
            new() { Id = 1 },
            new() { Id = 2 },
            new() { Id = 3 }
        };

        _recordRepositoryMock.Setup(r => r.ListAllAsync(true, cancellationToken))
            .ReturnsAsync(records);
        _mapperMock.Setup(m => m.Map<MedicalRecordDto>(It.IsAny<MedicalRecord>()))
            .Returns((MedicalRecord r) => new MedicalRecordDto { Id = r.Id });

        // Act
        var result = await _sut.ListAllAsync(true, "user123", role, cancellationToken);

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task ListAllAsync_WithUnauthorizedRole_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.ListAllAsync(true, "user123", "Patient", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*not authorized*");
    }

    #endregion

    #region ArchiveAsync Tests

    [Fact]
    public async Task ArchiveAsync_WithAdminRole_ShouldArchiveRecord()
    {
        // Arrange
        var recordId = 1;
        var actorUserId = "admin123";
        var cancellationToken = CancellationToken.None;
        var record = new MedicalRecord { Id = recordId, IsArchived = false };

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync(record);
        _recordRepositoryMock.Setup(r => r.UpdateAsync(record, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);
        _auditLoggerMock.Setup(a => a.LogAsync(
            It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.ArchiveAsync(recordId, true, actorUserId, "Admin", cancellationToken);

        // Assert
        record.IsArchived.Should().BeTrue();
        record.UpdatedOn.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        
        _auditLoggerMock.Verify(a => a.LogAsync(
            nameof(MedicalRecord), recordId, "Archive", actorUserId,
            It.IsAny<object>(), record, cancellationToken), Times.Once);
    }

    [Theory]
    [InlineData("Doctor")]
    [InlineData("Nurse")]
    [InlineData("Patient")]
    public async Task ArchiveAsync_WithNonAdminRole_ShouldThrowBusinessRuleException(string role)
    {
        // Arrange
        var recordId = 1;
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.ArchiveAsync(recordId, true, "user123", role, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*not authorized*");
    }

    #endregion

    #region SoftDeleteAsync Tests

    [Theory]
    [InlineData("Admin")]
    [InlineData("Doctor")]
    [InlineData("Nurse")]
    public async Task SoftDeleteAsync_WithAuthorizedRole_ShouldMarkAsDeleted(string role)
    {
        // Arrange
        var recordId = 1;
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;
        var record = new MedicalRecord { Id = recordId, IsDeleted = false };

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync(record);
        _recordRepositoryMock.Setup(r => r.UpdateAsync(record, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);
        _auditLoggerMock.Setup(a => a.LogAsync(
            It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.SoftDeleteAsync(recordId, actorUserId, role, cancellationToken);

        // Assert
        record.IsDeleted.Should().BeTrue();
        
        _auditLoggerMock.Verify(a => a.LogAsync(
            nameof(MedicalRecord), recordId, "SoftDelete", actorUserId,
            It.IsAny<object>(), record, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task SoftDeleteAsync_WithUnauthorizedRole_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var recordId = 1;
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.SoftDeleteAsync(recordId, "user123", "Patient", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*not authorized*");
    }

    #endregion

    #region UploadAttachmentAsync Tests

    [Theory]
    [InlineData("Admin")]
    [InlineData("Doctor")]
    [InlineData("Nurse")]
    public async Task UploadAttachmentAsync_WithAuthorizedRole_ShouldUploadFileSuccessfully(string role)
    {
        // Arrange
        var recordId = 1;
        var fileName = "test-file.pdf";
        var contentType = "application/pdf";
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;
        var record = new MedicalRecord { Id = recordId, PatientId = 5 };
        var fileStream = new MemoryStream();

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync(record);
        _fileStorageMock.Setup(f => f.SaveAsync(fileStream, It.IsAny<string>(), contentType, cancellationToken))
            .ReturnsAsync("/uploads/test-file.pdf");
        _fileStorageMock.Setup(f => f.ToPublicUrl(It.IsAny<string>()))
            .Returns((string path) => $"http://localhost:5012{path}");
        _recordRepositoryMock.Setup(r => r.UpdateAsync(record, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);
        _auditLoggerMock.Setup(a => a.LogAsync(
            It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<object>(), It.IsAny<object>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _sut.UploadAttachmentAsync(recordId, fileName, contentType, fileStream, actorUserId, role, cancellationToken);

        // Assert
        result.Should().NotBeNullOrEmpty();
        record.AttachmentUrl.Should().NotBeNullOrEmpty();
        record.UpdatedOn.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        
        _fileStorageMock.Verify(f => f.SaveAsync(fileStream, It.Is<string>(s => s.Contains($"records/{record.PatientId}/")), contentType, cancellationToken), Times.Once);
        _auditLoggerMock.Verify(a => a.LogAsync(
            nameof(MedicalRecord), recordId, "UploadAttachment", actorUserId,
            It.IsAny<object>(), record, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UploadAttachmentAsync_WithUnauthorizedRole_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var recordId = 1;
        var fileStream = new MemoryStream();
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.UploadAttachmentAsync(recordId, "file.pdf", "application/pdf", fileStream, "user123", "Patient", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*not authorized*");
    }

    [Fact]
    public async Task UploadAttachmentAsync_WithNonExistentRecord_ShouldThrowNotFoundException()
    {
        // Arrange
        var recordId = 999;
        var fileStream = new MemoryStream();
        var cancellationToken = CancellationToken.None;

        _recordRepositoryMock.Setup(r => r.GetByIdTrackedAsync(recordId, cancellationToken))
            .ReturnsAsync((MedicalRecord?)null);

        // Act
        var act = async () => await _sut.UploadAttachmentAsync(recordId, "file.pdf", "application/pdf", fileStream, "user123", "Admin", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(MedicalRecord)}*999*");
    }

    #endregion
}
