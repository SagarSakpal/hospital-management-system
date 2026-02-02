using FluentValidation;
using Hospital.Application.DTO;

namespace Hospital.Application.Validation
{
    public class CreateDoctorRequestValidator : AbstractValidator<CreateDoctorRequest>
    {
        public CreateDoctorRequestValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.SpecializationId).GreaterThan(0);
            RuleFor(x => x.ExperienceYears).InclusiveBetween(0, 60);
            RuleFor(x => x.Contact).NotEmpty().MaximumLength(100);
        }
    }
}
