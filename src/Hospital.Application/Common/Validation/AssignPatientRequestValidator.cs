using FluentValidation;
using Hospital.Application.DTO.DoctorPatient;

public class AssignPatientRequestValidator : AbstractValidator<AssignPatientRequest>
{
    public AssignPatientRequestValidator()
    {
        RuleFor(x => x.DoctorId).GreaterThan(0);
        RuleFor(x => x.PatientId).GreaterThan(0);
    }
}
