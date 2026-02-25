using AutoMapper;
using FluentAssertions;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO;
using Hospital.Application.Services;
using Hospital.Domain.Entities;
using Moq;

namespace Hospital.UnitTests.Services;

public class DoctorServiceTests
{
    private readonly Mock<IDoctorRepository> _doctorRepositoryMock;
    private readonly Mock<IPatientRepository> _patientRepositoryMock;
    private readonly Mock<IDoctorPatientRepository> _doctorPatientRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly DoctorService _sut;

    public DoctorServiceTests()
    {
        _doctorRepositoryMock = new Mock<IDoctorRepository>();
        _patientRepositoryMock = new Mock<IPatientRepository>();
        _doctorPatientRepositoryMock = new Mock<IDoctorPatientRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        
        _sut = new DoctorService(
            _doctorRepositoryMock.Object,
            _patientRepositoryMock.Object,
            _doctorPatientRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _mapperMock.Object);
    }

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidRequest_ShouldCreateDoctorSuccessfully()
    {
        // Arrange
        var request = new CreateDoctorRequest
        {
            UserId = "doctor123",
            Name = "Dr. Smith",
            SpecializationId = 1,
            Contact = "1234567890",
            ExperienceYears = 10
        };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;

        var doctor = new Doctor
        {
            Id = 1,
            UserId = "doctor123",
            Name = "Dr. Smith"
        };
        var doctorDto = new DoctorDto { Id = 1, Name = "Dr. Smith" };

        _doctorRepositoryMock.Setup(r => r.UserIdExistsAsync(request.UserId, null, cancellationToken))
            .ReturnsAsync(false);
        _doctorRepositoryMock.Setup(r => r.ContactExistsAsync(request.Contact, null, cancellationToken))
            .ReturnsAsync(false);
        _mapperMock.Setup(m => m.Map<Doctor>(request)).Returns(doctor);
        _mapperMock.Setup(m => m.Map<DoctorDto>(doctor)).Returns(doctorDto);
        _doctorRepositoryMock.Setup(r => r.AddAsync(doctor, cancellationToken))
            .ReturnsAsync(doctor);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        var result = await _sut.CreateAsync(request, performedByUserId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        result.Name.Should().Be("Dr. Smith");
        
        _doctorRepositoryMock.Verify(r => r.AddAsync(doctor, cancellationToken), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(cancellationToken), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateUserId_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var request = new CreateDoctorRequest
        {
            UserId = "doctor123",
            Name = "Dr. Smith",
            Contact = "1234567890"
        };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.UserIdExistsAsync(request.UserId, null, cancellationToken))
            .ReturnsAsync(true);

        // Act
        var act = async () => await _sut.CreateAsync(request, performedByUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage($"*UserId '{request.UserId}' already exists*");
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateContact_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var request = new CreateDoctorRequest
        {
            UserId = "doctor123",
            Name = "Dr. Smith",
            Contact = "1234567890"
        };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.UserIdExistsAsync(request.UserId, null, cancellationToken))
            .ReturnsAsync(false);
        _doctorRepositoryMock.Setup(r => r.ContactExistsAsync(request.Contact, null, cancellationToken))
            .ReturnsAsync(true);

        // Act
        var act = async () => await _sut.CreateAsync(request, performedByUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage($"*Contact '{request.Contact}' already exists*");
    }

    #endregion

    #region GetAsync Tests

    [Fact]
    public async Task GetAsync_WithValidId_ShouldReturnDoctorDto()
    {
        // Arrange
        var doctorId = 1;
        var cancellationToken = CancellationToken.None;
        var doctor = new Doctor { Id = doctorId, Name = "Dr. Smith" };
        var doctorDto = new DoctorDto { Id = doctorId, Name = "Dr. Smith" };

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync(doctor);
        _mapperMock.Setup(m => m.Map<DoctorDto>(doctor)).Returns(doctorDto);

        // Act
        var result = await _sut.GetAsync(doctorId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(doctorId);
        result.Name.Should().Be("Dr. Smith");
    }

    [Fact]
    public async Task GetAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var doctorId = 999;
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync((Doctor?)null);

        // Act
        var act = async () => await _sut.GetAsync(doctorId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Doctor)}*{doctorId}*");
    }

    #endregion

    #region ListAsync Tests

    [Fact]
    public async Task ListAsync_ShouldReturnAllDoctors()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        var doctors = new List<Doctor>
        {
            new() { Id = 1, Name = "Dr. Smith" },
            new() { Id = 2, Name = "Dr. Jones" },
            new() { Id = 3, Name = "Dr. Brown" }
        };
        var doctorDtos = doctors.Select(d => new DoctorDto { Id = d.Id, Name = d.Name }).ToList();

        _doctorRepositoryMock.Setup(r => r.ListAsync(null, cancellationToken))
            .ReturnsAsync(doctors);
        _mapperMock.Setup(m => m.Map<DoctorDto>(It.IsAny<Doctor>()))
            .Returns((Doctor d) => new DoctorDto { Id = d.Id, Name = d.Name });

        // Act
        var result = await _sut.ListAsync(cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.Should().BeEquivalentTo(doctorDtos);
    }

    [Fact]
    public async Task ListAsync_WhenNoDoctors_ShouldReturnEmptyList()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        _doctorRepositoryMock.Setup(r => r.ListAsync(null, cancellationToken))
            .ReturnsAsync(new List<Doctor>());

        // Act
        var result = await _sut.ListAsync(cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldUpdateDoctor()
    {
        // Arrange
        var doctorId = 1;
        var request = new UpdateDoctorRequest
        {
            Name = "Dr. Smith Updated",
            Contact = "9876543210",
            SpecializationId = 2,
            ExperienceYears = 15
        };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;
        var existingDoctor = new Doctor
        {
            Id = doctorId,
            Name = "Dr. Smith",
            Contact = "1234567890"
        };

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync(existingDoctor);
        _doctorRepositoryMock.Setup(r => r.ContactExistsAsync(request.Contact, doctorId, cancellationToken))
            .ReturnsAsync(false);
        _mapperMock.Setup(m => m.Map(request, existingDoctor)).Verifiable();
        _doctorRepositoryMock.Setup(r => r.UpdateAsync(existingDoctor, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        await _sut.UpdateAsync(doctorId, request, performedByUserId, cancellationToken);

        // Assert
        _mapperMock.Verify(m => m.Map(request, existingDoctor), Times.Once);
        _doctorRepositoryMock.Verify(r => r.UpdateAsync(existingDoctor, cancellationToken), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(cancellationToken), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var doctorId = 999;
        var request = new UpdateDoctorRequest { Name = "Updated Name" };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync((Doctor?)null);

        // Act
        var act = async () => await _sut.UpdateAsync(doctorId, request, performedByUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Doctor)}*{doctorId}*");
        
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WithDuplicateContact_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var doctorId = 1;
        var request = new UpdateDoctorRequest
        {
            Name = "Dr. Smith",
            Contact = "existing-contact"
        };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;
        var existingDoctor = new Doctor { Id = doctorId, Name = "Dr. Smith" };

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync(existingDoctor);
        _doctorRepositoryMock.Setup(r => r.ContactExistsAsync(request.Contact, doctorId, cancellationToken))
            .ReturnsAsync(true);

        // Act
        var act = async () => await _sut.UpdateAsync(doctorId, request, performedByUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage($"*Contact '{request.Contact}' already exists*");
    }

    #endregion

    #region PatchAsync Tests

    [Fact]
    public async Task PatchAsync_WithNameOnly_ShouldUpdateNameOnly()
    {
        // Arrange
        var doctorId = 1;
        var request = new PatchDoctorRequest { Name = "Updated Name" };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;
        var doctor = new Doctor
        {
            Id = doctorId,
            Name = "Original Name",
            SpecializationId = 1,
            ExperienceYears = 10
        };

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync(doctor);
        _doctorRepositoryMock.Setup(r => r.UpdateAsync(doctor, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        await _sut.PatchAsync(doctorId, request, performedByUserId, cancellationToken);

        // Assert
        doctor.Name.Should().Be("Updated Name");
        doctor.SpecializationId.Should().Be(1); // Unchanged
        doctor.ExperienceYears.Should().Be(10); // Unchanged
    }

    [Fact]
    public async Task PatchAsync_WithMultipleFields_ShouldUpdateSpecifiedFieldsOnly()
    {
        // Arrange
        var doctorId = 1;
        var request = new PatchDoctorRequest
        {
            Name = "Updated Name",
            ExperienceYears = 15
        };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;
        var doctor = new Doctor
        {
            Id = doctorId,
            Name = "Original Name",
            SpecializationId = 1,
            ExperienceYears = 10
        };

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync(doctor);
        _doctorRepositoryMock.Setup(r => r.UpdateAsync(doctor, cancellationToken))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);

        // Act
        await _sut.PatchAsync(doctorId, request, performedByUserId, cancellationToken);

        // Assert
        doctor.Name.Should().Be("Updated Name");
        doctor.ExperienceYears.Should().Be(15);
        doctor.SpecializationId.Should().Be(1); // Unchanged
    }

    [Fact]
    public async Task PatchAsync_WithNonExistentId_ShouldThrowNotFoundException()
    {
        // Arrange
        var doctorId = 999;
        var request = new PatchDoctorRequest { Name = "Updated Name" };
        var performedByUserId = "admin123";
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.GetByIdAsync(doctorId, cancellationToken))
            .ReturnsAsync((Doctor?)null);

        // Act
        var act = async () => await _sut.PatchAsync(doctorId, request, performedByUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Doctor)}*{doctorId}*");
    }

    #endregion
}
