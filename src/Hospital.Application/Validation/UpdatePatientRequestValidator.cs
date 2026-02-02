using FluentValidation;
using Hospital.Application.DTO;

namespace Hospital.Application.Validation
{
    public class UpdatePatientRequestValidator : AbstractValidator<UpdatePatientRequest>
    {
        public UpdatePatientRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.Gender).NotEmpty();
            RuleFor(x => x.Contact).NotEmpty();
            RuleFor(x => x.Condition).NotEmpty();
        }
    }
}
