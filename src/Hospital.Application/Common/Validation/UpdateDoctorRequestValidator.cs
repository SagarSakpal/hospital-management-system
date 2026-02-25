using FluentValidation;
using Hospital.Application.DTO;

namespace Hospital.Application.Validation
{
    public class UpdateDoctorRequestValidator : AbstractValidator<UpdateDoctorRequest>
    {
        public UpdateDoctorRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.SpecializationId).GreaterThan(0);
            RuleFor(x => x.ExperienceYears).InclusiveBetween(0, 60);
            RuleFor(x => x.Contact).NotEmpty().MaximumLength(100);
        }
    }
}
