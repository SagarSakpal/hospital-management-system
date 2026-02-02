using AutoMapper;
using Hospital.Application.DTO;
using Hospital.Application.DTO.DoctorPatient;
using Hospital.Domain.Entities;

namespace Hospital.Application.Common.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Doctor, DoctorDto>().ReverseMap();
            CreateMap<CreateDoctorRequest, Doctor>();
            CreateMap<UpdateDoctorRequest, Doctor>();
            CreateMap<Appointment, AppointmentDto>().ReverseMap();
            CreateMap<Patient, PatientDto>().ReverseMap();
            CreateMap<DoctorPatient, DoctorPatientDto>();
            CreateMap<CreatePatientRequest, Patient>();
            CreateMap<UpdatePatientRequest, Patient>();
            CreateMap<CreateAppointmentRequest, Appointment>()


                .ForMember(d => d.EndTime, opt => opt.MapFrom(s => s.StartTime.AddHours(1))); // enforce 1-hour slot
        }
    }
}
