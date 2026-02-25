using FluentValidation;
using Hospital.Application.DTO;

namespace Hospital.Application.Validation
{
    public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
    {
        public CreateAppointmentRequestValidator()
        {
            RuleFor(x => x.DoctorId)
                .GreaterThan(0)
                .WithMessage("DoctorId must be greater than 0.");
            
            RuleFor(x => x.PatientId)
                .GreaterThan(0)
                .WithMessage("PatientId must be greater than 0.");

            RuleFor(x => x.StartTime)
                .Must(x => x.Minute == 0)
                .WithMessage("Appointments must start on the hour (00 minutes).")
                .Must(x => x > DateTime.UtcNow.AddMinutes(-5))
                .WithMessage("Start time must be in the future.")
                .NotEmpty()
                .WithMessage("Start time is required.");
        }
    }
}
