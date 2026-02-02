using FluentValidation;
using Hospital.Application.DTO;

namespace Hospital.Application.Validation
{
    public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
    {
        public CreateAppointmentRequestValidator()
        {
            RuleFor(x => x.DoctorId).GreaterThan(0);
            RuleFor(x => x.PatientId).GreaterThan(0);
            RuleFor(x => x.StartTime)
                .Must(s => s > DateTime.UtcNow.AddMinutes(-1))
                .WithMessage("StartTime must be in the future or near-present.")
                .Must(s => s.Minute == 0 || s.Minute == 30) // If you want 30-min alignment. For 1-hour alignment use == 0 only
                .WithMessage("StartTime must align to 0 or 30 minutes (adjust rule if needed).");
        }
    }
}
