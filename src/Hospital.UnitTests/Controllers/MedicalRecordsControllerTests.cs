using FluentAssertions;
using Hospital.Api.Controllers;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.DTO.MedicalRecords;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace Hospital.UnitTests.Controllers;

public class MedicalRecordsControllerTests
{
    private readonly Mock<IMedicalRecordService> _serviceMock;
    private readonly MedicalRecordsController _sut;
    private readonly string _actorUserId = "user123";
    private readonly string _actorRole = "Doctor";

    public MedicalRecordsControllerTests()
    {
        _serviceMock = new Mock<IMedicalRecordService>();
        _sut = new MedicalRecordsController(_serviceMock.Object);
        
        // Setup HttpContext with Claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, _actorUserId),
            new(ClaimTypes.Role, _actorRole)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    #region Create Tests

    [Fact]
    public async Task Create_WithValidRequest_ShouldReturnCreatedRecord()
    {
        // Arrange
        var request = new CreateMedicalRecordRequest
        {
            PatientId = 1,
            DoctorId = 2,
            RecordType = "Diagnosis",
            Description = "Test"
        };
        var expectedDto = new MedicalRecordDto { Id = 1, RecordType = "Diagnosis" };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.CreateAsync(request, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _sut.Create(request, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        result.RecordType.Should().Be("Diagnosis");
        
        _serviceMock.Verify(s => s.CreateAsync(request, _actorUserId, _actorRole, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Create_WhenServiceThrowsNotFoundException_ShouldPropagateException()
    {
        // Arrange
        var request = new CreateMedicalRecordRequest { PatientId = 999, DoctorId = 2 };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.CreateAsync(request, _actorUserId, _actorRole, cancellationToken))
            .ThrowsAsync(new NotFoundException("Patient", 999));

        // Act
        var act = async () => await _sut.Create(request, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    #endregion

    #region Get Tests

    [Fact]
    public async Task Get_WithValidId_ShouldReturnRecord()
    {
        // Arrange
        var recordId = 1;
        var expectedDto = new MedicalRecordDto { Id = recordId, RecordType = "Test" };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.GetAsync(recordId, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _sut.Get(recordId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(recordId);
    }

    [Fact]
    public async Task Get_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var recordId = 999;
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.GetAsync(recordId, _actorUserId, _actorRole, cancellationToken))
            .ThrowsAsync(new NotFoundException("MedicalRecord", recordId));

        // Act
        var act = async () => await _sut.Get(recordId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    #endregion

    #region ListAll Tests

    [Fact]
    public async Task ListAll_ShouldReturnAllRecords()
    {
        // Arrange
        var records = new List<MedicalRecordDto>
        {
            new() { Id = 1, RecordType = "Type1" },
            new() { Id = 2, RecordType = "Type2" }
        };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.ListAllAsync(true, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(records);

        // Act
        var result = await _sut.ListAll(true, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    #endregion

    #region ListByPatient Tests

    [Fact]
    public async Task ListByPatient_ShouldReturnPatientRecords()
    {
        // Arrange
        var patientId = 1;
        var records = new List<MedicalRecordDto>
        {
            new() { Id = 1, PatientId = patientId },
            new() { Id = 2, PatientId = patientId }
        };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.ListByPatientAsync(patientId, true, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(records);

        // Act
        var result = await _sut.ListByPatient(patientId, true, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(r => r.PatientId.Should().Be(patientId));
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_WithValidRequest_ShouldReturnUpdatedRecord()
    {
        // Arrange
        var recordId = 1;
        var request = new UpdateMedicalRecordRequest
        {
            RecordType = "Updated Type",
            Description = "Updated description"
        };
        var expectedDto = new MedicalRecordDto { Id = recordId, RecordType = "Updated Type" };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.UpdateAsync(recordId, request, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _sut.Update(recordId, request, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(recordId);
        result.RecordType.Should().Be("Updated Type");
    }

    #endregion

    #region Archive Tests

    [Fact]
    public async Task Archive_WithValidRequest_ShouldArchiveRecord()
    {
        // Arrange
        var recordId = 1;
        var request = new ArchiveMedicalRecordRequest { Archive = true };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.ArchiveAsync(recordId, request.Archive, _actorUserId, _actorRole, cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.Archive(recordId, request, cancellationToken);

        // Assert
        _serviceMock.Verify(s => s.ArchiveAsync(recordId, true, _actorUserId, _actorRole, cancellationToken), Times.Once);
    }

    #endregion

    #region SoftDelete Tests

    [Fact]
    public async Task SoftDelete_WithValidId_ShouldDeleteRecord()
    {
        // Arrange
        var recordId = 1;
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.SoftDeleteAsync(recordId, _actorUserId, _actorRole, cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.SoftDelete(recordId, cancellationToken);

        // Assert
        _serviceMock.Verify(s => s.SoftDeleteAsync(recordId, _actorUserId, _actorRole, cancellationToken), Times.Once);
    }

    #endregion

    #region Upload Tests

    [Fact]
    public async Task Upload_WithValidFile_ShouldCallServiceAndReturnUrl()
    {
        // Arrange
        var recordId = 1;
        var fileName = "test-file.pdf";
        var contentType = "application/pdf";
        var fileContent = new byte[] { 1, 2, 3, 4, 5 };
        var expectedUrl = "/uploads/records/1/test-file.pdf";
        var cancellationToken = CancellationToken.None;

        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.FileName).Returns(fileName);
        fileMock.Setup(f => f.ContentType).Returns(contentType);
        fileMock.Setup(f => f.Length).Returns(fileContent.Length);
        fileMock.Setup(f => f.OpenReadStream()).Returns(new MemoryStream(fileContent));

        _serviceMock.Setup(s => s.UploadAttachmentAsync(
            recordId, fileName, contentType, It.IsAny<Stream>(), _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(expectedUrl);

        // Act
        var result = await _sut.Upload(recordId, fileMock.Object, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        _serviceMock.Verify(s => s.UploadAttachmentAsync(
            recordId, fileName, contentType, It.IsAny<Stream>(), _actorUserId, _actorRole, cancellationToken), Times.Once());
    }

    [Fact]
    public async Task Upload_WithNullFile_ShouldReturnBadRequest()
    {
        // Arrange
        var recordId = 1;
        var cancellationToken = CancellationToken.None;

        // Act
        var result = await _sut.Upload(recordId, null, cancellationToken);

        // Assert
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var problemDetails = badRequestResult.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Detail.Should().Contain("No file provided");
    }

    [Fact]
    public async Task Upload_WithEmptyFile_ShouldReturnBadRequest()
    {
        // Arrange
        var recordId = 1;
        var cancellationToken = CancellationToken.None;

        var fileMock = new Mock<IFormFile>();
        fileMock.Setup(f => f.Length).Returns(0);

        // Act
        var result = await _sut.Upload(recordId, fileMock.Object, cancellationToken);

        // Assert
        var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var problemDetails = badRequestResult.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Detail.Should().Contain("No file provided");
    }

    #endregion

    #region DownloadAttachment Tests

    [Fact]
    public async Task DownloadAttachment_WithValidId_ShouldReturnFile()
    {
        // Arrange
        var recordId = 1;
        var attachmentUrl = "/uploads/records/1/test-file.pdf";
        var recordDto = new MedicalRecordDto
        {
            Id = recordId,
            AttachmentUrl = attachmentUrl
        };
        var cancellationToken = CancellationToken.None;

        // Create a test file
        var testFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", attachmentUrl.TrimStart('/'));
        Directory.CreateDirectory(Path.GetDirectoryName(testFilePath)!);
        await File.WriteAllBytesAsync(testFilePath, new byte[] { 1, 2, 3, 4, 5 }, cancellationToken);

        _serviceMock.Setup(s => s.GetAsync(recordId, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(recordDto);

        try
        {
            // Act
            var result = await _sut.DownloadAttachment(recordId, cancellationToken);

            // Assert
            result.Should().BeOfType<FileContentResult>();
            var fileResult = (FileContentResult)result;
            fileResult.ContentType.Should().Be("application/pdf");
            fileResult.FileContents.Should().HaveCountGreaterThan(0);
        }
        finally
        {
            // Cleanup
            if (File.Exists(testFilePath))
                File.Delete(testFilePath);
        }
    }

    [Fact]
    public async Task DownloadAttachment_WithNoAttachment_ShouldReturnNotFound()
    {
        // Arrange
        var recordId = 1;
        var recordDto = new MedicalRecordDto
        {
            Id = recordId,
            AttachmentUrl = null
        };
        var cancellationToken = CancellationToken.None;

        _serviceMock.Setup(s => s.GetAsync(recordId, _actorUserId, _actorRole, cancellationToken))
            .ReturnsAsync(recordDto);

        // Act
        var result = await _sut.DownloadAttachment(recordId, cancellationToken);

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        var problemDetails = notFoundResult.Value.Should().BeOfType<ProblemDetails>().Subject;
        problemDetails.Detail.Should().Contain("No attachment found");
    }

    #endregion
}
