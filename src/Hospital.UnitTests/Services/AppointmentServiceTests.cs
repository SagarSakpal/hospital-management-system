using AutoMapper;
using FluentAssertions;
using Hospital.Application.Common.Exceptions;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.DTO;
using Hospital.Application.Services;
using Hospital.Domain.Entities;
using Moq;
using System.Linq.Expressions;

namespace Hospital.UnitTests.Services;

public class AppointmentServiceTests
{
    private readonly Mock<IAppointmentRepository> _appointmentRepositoryMock;
    private readonly Mock<IDoctorRepository> _doctorRepositoryMock;
    private readonly Mock<IPatientRepository> _patientRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly AppointmentService _sut;

    public AppointmentServiceTests()
    {
        _appointmentRepositoryMock = new Mock<IAppointmentRepository>();
        _doctorRepositoryMock = new Mock<IDoctorRepository>();
        _patientRepositoryMock = new Mock<IPatientRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        
        _sut = new AppointmentService(
            _appointmentRepositoryMock.Object,
            _doctorRepositoryMock.Object,
            _patientRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _mapperMock.Object);
    }

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidRequest_ShouldCreateAppointmentSuccessfully()
    {
        // Arrange
        var startTime = DateTime.UtcNow.AddDays(1);
        var request = new CreateAppointmentRequest
        {
            DoctorId = 1,
            PatientId = 2,
            StartTime = startTime,
            Notes = "Check-up"
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        var appointment = new Appointment
        {
            Id = 1,
            DoctorId = 1,
            PatientId = 2,
            StartTime = startTime,
            EndTime = startTime.AddHours(1)
        };

        var appointmentDto = new AppointmentDto
        {
            Id = 1,
            DoctorId = 1,
            PatientId = 2,
            StartTime = startTime,
            EndTime = startTime.AddHours(1)
        };

        _doctorRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Doctor, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _patientRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Patient, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _mapperMock.Setup(m => m.Map<Appointment>(request)).Returns(appointment);
        _appointmentRepositoryMock.Setup(r => r.HasOverlapAsync(
            request.DoctorId, appointment.StartTime, appointment.EndTime, null, cancellationToken))
            .ReturnsAsync(false);
        _appointmentRepositoryMock.Setup(r => r.AddAsync(appointment, cancellationToken))
            .ReturnsAsync(appointment);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(cancellationToken))
            .ReturnsAsync(1);
        _mapperMock.Setup(m => m.Map<AppointmentDto>(appointment)).Returns(appointmentDto);

        // Act
        var result = await _sut.CreateAsync(request, actorUserId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        appointment.Status.Should().Be("Scheduled");
        appointment.CreatedByUserId.Should().Be(actorUserId);
        
        _appointmentRepositoryMock.Verify(r => r.AddAsync(appointment, cancellationToken), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(cancellationToken), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithEmptyActorUserId_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var request = new CreateAppointmentRequest
        {
            DoctorId = 1,
            PatientId = 2,
            StartTime = DateTime.UtcNow.AddDays(1)
        };
        var cancellationToken = CancellationToken.None;

        // Act
        var act = async () => await _sut.CreateAsync(request, "", cancellationToken);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*authentication*");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentDoctor_ShouldThrowNotFoundException()
    {
       // Arrange
        var request = new CreateAppointmentRequest
        {
            DoctorId = 999,
            PatientId = 2,
            StartTime = DateTime.UtcNow.AddDays(1)
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Doctor, bool>>>(), cancellationToken))
            .ReturnsAsync(false);

        // Act
        var act = async () => await _sut.CreateAsync(request, actorUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Doctor)}*{request.DoctorId}*");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentPatient_ShouldThrowNotFoundException()
    {
        // Arrange
        var request = new CreateAppointmentRequest
        {
            DoctorId = 1,
            PatientId = 999,
            StartTime = DateTime.UtcNow.AddDays(1)
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        _doctorRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Doctor, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _patientRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Patient, bool>>>(), cancellationToken))
            .ReturnsAsync(false);

        // Act
        var act = async () => await _sut.CreateAsync(request, actorUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{nameof(Patient)}*{request.PatientId}*");
    }

    [Fact]
    public async Task CreateAsync_WithTimeSlotConflict_ShouldThrowConflictException()
    {
        // Arrange
        var startTime = DateTime.UtcNow.AddDays(1);
        var request = new CreateAppointmentRequest
        {
            DoctorId = 1,
            PatientId = 2,
            StartTime = startTime
        };
        var actorUserId = "user123";
        var cancellationToken = CancellationToken.None;

        var appointment = new Appointment
        {
            DoctorId = 1,
            PatientId = 2,
            StartTime = startTime,
            EndTime = startTime.AddHours(1)
        };

        _doctorRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Doctor, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _patientRepositoryMock.Setup(r => r.ExistsAsync(It.IsAny<Expression<Func<Patient, bool>>>(), cancellationToken))
            .ReturnsAsync(true);
        _mapperMock.Setup(m => m.Map<Appointment>(request)).Returns(appointment);
        _appointmentRepositoryMock.Setup(r => r.HasOverlapAsync(
            request.DoctorId, appointment.StartTime, appointment.EndTime, null, cancellationToken))
            .ReturnsAsync(true);

        // Act
        var act = async () => await _sut.CreateAsync(request, actorUserId, cancellationToken);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*time slot*already booked*");
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithValidId_ShouldReturnAppointmentDto()
    {
        // Arrange
        var appointmentId = 1;
        var cancellationToken = CancellationToken.None;
        var appointment = new Appointment
        {
            Id = appointmentId,
            DoctorId = 1,
            PatientId = 2,
            StartTime = DateTime.UtcNow.AddDays(1),
            Status = "Scheduled"
        };
        var appointmentDto = new AppointmentDto { Id = appointmentId };

        _appointmentRepositoryMock.Setup(r => r.GetByIdAsync(appointmentId, cancellationToken))
            .ReturnsAsync(appointment);
        _mapperMock.Setup(m => m.Map<AppointmentDto>(appointment)).Returns(appointmentDto);

        // Act
        var result = await _sut.GetByIdAsync(appointmentId, cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(appointmentId);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentId_ShouldReturnNull()
    {
        // Arrange
        var appointmentId = 999;
        var cancellationToken = CancellationToken.None;

        _appointmentRepositoryMock.Setup(r => r.GetByIdAsync(appointmentId, cancellationToken))
            .ReturnsAsync((Appointment?)null);

        // Act
        var result = await _sut.GetByIdAsync(appointmentId, cancellationToken);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllAppointments()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        var appointments = new List<Appointment>
        {
            new() { Id = 1, DoctorId = 1, PatientId = 2 },
            new() { Id = 2, DoctorId = 2, PatientId = 3 },
            new() { Id = 3, DoctorId = 1, PatientId = 4 }
        };
        var appointmentDtos = new List<AppointmentDto>
        {
            new() { Id = 1 },
            new() { Id = 2 },
            new() { Id = 3 }
        };

        _appointmentRepositoryMock.Setup(r => r.ListAsync(null, cancellationToken))
            .ReturnsAsync(appointments);
        _mapperMock.Setup(m => m.Map<List<AppointmentDto>>(appointments))
            .Returns(appointmentDtos);

        // Act
        var result = await _sut.GetAllAsync(cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.Should().BeEquivalentTo(appointmentDtos);
    }

    [Fact]
    public async Task GetAllAsync_WhenNoAppointments_ShouldReturnEmptyList()
    {
        // Arrange
        var cancellationToken = CancellationToken.None;
        _appointmentRepositoryMock.Setup(r => r.ListAsync(null, cancellationToken))
            .ReturnsAsync(new List<Appointment>());
        _mapperMock.Setup(m => m.Map<List<AppointmentDto>>(It.IsAny<List<Appointment>>()))
            .Returns(new List<AppointmentDto>());

        // Act
        var result = await _sut.GetAllAsync(cancellationToken);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion
}
