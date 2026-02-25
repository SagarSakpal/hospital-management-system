using FluentValidation;
using Hospital.Application.DTO.MedicalRecords;

namespace Hospital.Application.Validation.MedicalRecords
{
    public class UpdateMedicalRecordRequestValidator : AbstractValidator<UpdateMedicalRecordRequest>
    {
        public UpdateMedicalRecordRequestValidator()
        {
            RuleFor(x => x.RecordType).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).NotEmpty();
        }
    }
}
