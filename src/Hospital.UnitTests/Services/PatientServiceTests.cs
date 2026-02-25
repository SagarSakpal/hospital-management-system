using AutoMapper;
using FluentAssertions;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO;
using Hospital.Application.Services;
using Hospital.Domain.Entities;
using Moq;

namespace Hospital.UnitTests.Services;

public class PatientServiceTests
{
    private readonly Mock<IPatientRepository> _patientRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly PatientService _sut; // System Under Test

    public PatientServiceTests()
    {
        _patientRepositoryMock = new Mock<IPatientRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _sut = new PatientService(_patientRepositoryMock.Object, _unitOfWorkMock.Object, _mapperMock.Object);
    }

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidRequest_ShouldCreatePatientAndReturnDto()
    {
        // Arrange
        var request = new CreatePatientRequest
        {
            UserId = "patient123",
            Name = "John Doe",
            DOB = new DateTime(1990, 1, 1),
            Gender = "Male",
            Contact = "1234567890",
            Condition = "Healthy"
        };
        var actor = "test-user";
        var cancellationToken = CancellationToken.None;

        var patient = new Patient { Id = 1, Name = "John Doe" };
        var patientDto = new PatientDto { Id = 1, Name = "John Doe" };

        _mapperMock.Setup(m => m.Map<Patient>(request)).Returns(patient);
        _mapperMock.Setup(m => m.Map<PatientDto>(patient)).Returns(patientDto);
        _patientRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Patient>(), cancellationToken))
            .ReturnsAsync(patient);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        var result = await _sut.CreateAsync(request, actor, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        result.Name.Should().Be("John Doe");
        
        _patientRepositoryMock.Verify(r => r.AddAsync(patient, cancellationToken), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(cancellationToken), Times.Once);
    }

    #endregion

    #region ListAsync Tests

    [Fact]
    public async Task ListAsync_ShouldReturnAllPatients()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        var patients = new List<Patient>
        {
            new() { Id = 1, Name = "Patient 1" },
            new() { Id = 2, Name = "Patient 2" },
            new() { Id = 3, Name = "Patient 3" }
        };
        var patientDtos = new List<PatientDto>
        {
            new() { Id = 1, Name = "Patient 1" },
            new() { Id = 2, Name = "Patient 2" },
            new() { Id = 3, Name = "Patient 3" }
        };

        _patientRepositoryMock.Setup(r => r.ListAsync(null, cancellationToken))
            .ReturnsAsync(patients);
        _mapperMock.Setup(m => m.Map<PatientDto>(It.IsAny<Patient>()))
            .Returns((Patient p) => patientDtos.First(dto => dto.Id == p.Id));

        // Act
        var result = await _sut.ListAsync(cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.Should().BeEquivalentTo(patientDtos);
    }

    [Fact]
    public async Task ListAsync_WhenNoPatients_ShouldReturnEmptyList()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        _patientRepositoryMock.Setup(r => r.ListAsync(null, cancellationToken))
            .ReturnsAsync(new List<Patient>());

        // Act
        var result = await _sut.ListAsync(cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region GetAsync Tests

    [Fact]
    public async Task GetAsync_WithValidId_ShouldReturnPatientDto()
    {
        // Arrange
        var patientId = 1;
        var cancellationToken = CancellationToken.None;
        var patient = new Patient { Id = patientId, Name = "John Doe" };
        var patientDto = new PatientDto { Id = patientId, Name = "John Doe" };

        _patientRepositoryMock.Setup(r => r.GetByIdAsync(patientId, cancellationToken))
            .ReturnsAsync(patient);
        _mapperMock.Setup(m => m.Map<PatientDto>(patient)).Returns(patientDto);

        // Act
        var result = await _sut.GetAsync(patientId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(patientId);
        result.Name.Should().Be("John Doe");
    }

    [Fact]
    public async Task GetAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var patientId = 999;
        var cancellationToken = CancellationToken.None;

        _patientRepositoryMock.Setup(r => r.GetByIdAsync(patientId, cancellationToken))
            .ReturnsAsync((Patient?)null);

        // Act
        var act = async () => await _sut.GetAsync(patientId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Patient)}*{patientId}*");
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldUpdatePatient()
    {
        // Arrange
        var patientId = 1;
        var request = new UpdatePatientRequest
        {
            Name = "Updated Name",
            Contact = "9876543210"
        };
        var actor = "test-user";
        var cancellationToken = CancellationToken.None;
        var existingPatient = new Patient { Id = patientId, Name = "Old Name" };

        _patientRepositoryMock.Setup(r => r.GetByIdAsync(patientId, cancellationToken))
            .ReturnsAsync(existingPatient);
        _mapperMock.Setup(m => m.Map(request, existingPatient))
            .Verifiable();
        _patientRepositoryMock.Setup(r => r.UpdateAsync(existingPatient, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        await _sut.UpdateAsync(patientId, request, actor, cancellationToken);

        // Assert
        _patientRepositoryMock.Verify(r => r.GetByIdAsync(patientId, cancellationToken), Times.Once);
        _mapperMock.Verify(m => m.Map(request, existingPatient), Times.Once);
        _patientRepositoryMock.Verify(r => r.UpdateAsync(existingPatient, cancellationToken), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var patientId = 999;
        var request = new UpdatePatientRequest { Name = "Updated Name" };
        var actor = "test-user";
        var cancellationToken = CancellationToken.None;

        _patientRepositoryMock.Setup(r => r.GetByIdAsync(patientId, cancellationToken))
            .ReturnsAsync((Patient?)null);

        // Act
        var act = async () => await _sut.UpdateAsync(patientId, request, actor, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Patient)}*{patientId}*");
        
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region SoftDeleteAsync Tests

    [Fact]
    public async Task SoftDeleteAsync_WithValidId_ShouldMarkPatientAsDeleted()
    {
        // Arrange
        var patientId = 1;
        var actor = "test-user";
        var cancellationToken = CancellationToken.None;
        var patient = new Patient { Id = patientId, Name = "John Doe", IsDeleted = false };

        _patientRepositoryMock.Setup(r => r.GetByIdAsync(patientId, cancellationToken))
            .ReturnsAsync(patient);
        _patientRepositoryMock.Setup(r => r.UpdateAsync(patient, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        await _sut.SoftDeleteAsync(patientId, actor, cancellationToken);

        // Assert
        patient.IsDeleted.Should().BeTrue();
        _patientRepositoryMock.Verify(r => r.UpdateAsync(patient, cancellationToken), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(cancellationToken), Times.Once);
    }

    [Fact]
    public async Task SoftDeleteAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var patientId = 999;
        var actor = "test-user";
        var cancellationToken = CancellationToken.None;

        _patientRepositoryMock.Setup(r => r.GetByIdAsync(patientId, cancellationToken))
            .ReturnsAsync((Patient?)null);

        // Act
        var act = async () => await _sut.SoftDeleteAsync(patientId, actor, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Patient)}*{patientId}*");
        
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion
}
