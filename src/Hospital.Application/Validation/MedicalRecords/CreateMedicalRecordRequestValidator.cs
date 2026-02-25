using FluentValidation;
using Hospital.Application.DTO.MedicalRecords;

namespace Hospital.Application.Validation.MedicalRecords
{
    public class CreateMedicalRecordRequestValidator : AbstractValidator<CreateMedicalRecordRequest>
    {
        public CreateMedicalRecordRequestValidator()
        {
            RuleFor(x => x.PatientId).GreaterThan(0);
            RuleFor(x => x.DoctorId).GreaterThan(0);
            RuleFor(x => x.RecordType).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).NotEmpty();
        }
    }
}
