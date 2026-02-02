using FluentValidation;
using Hospital.Application.DTO;

namespace Hospital.Application.Validation
{
    public class CreatePatientRequestValidator : AbstractValidator<CreatePatientRequest>
    {
        public CreatePatientRequestValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Gender).NotEmpty();
            RuleFor(x => x.Contact).NotEmpty();
            RuleFor(x => x.Condition).NotEmpty();
        }
    }
}
