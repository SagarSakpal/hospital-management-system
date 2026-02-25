using AutoMapper;
using Hospital.Application.DTO;
using Hospital.Application.DTO.DoctorPatient;
using Hospital.Application.DTO.MedicalRecords;
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
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(d => d.DoctorName, opt => opt.MapFrom(s => s.Doctor != null ? s.Doctor.Name : null))
                .ForMember(d => d.PatientName, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Name : null))
                .ReverseMap();
            CreateMap<Patient, PatientDto>().ReverseMap();
            CreateMap<DoctorPatient, DoctorPatientDto>();
            CreateMap<CreatePatientRequest, Patient>();
            CreateMap<UpdatePatientRequest, Patient>();
            
            CreateMap<MedicalRecord, MedicalRecordDto>()
                .ForMember(d => d.PatientName, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Name : null))
                .ForMember(d => d.DoctorName, opt => opt.MapFrom(s => s.Doctor != null ? s.Doctor.Name : null));
            
            CreateMap<CreateMedicalRecordRequest, MedicalRecord>();
            CreateMap<UpdateMedicalRecordRequest, MedicalRecord>();

            CreateMap<CreateAppointmentRequest, Appointment>()


                .ForMember(d => d.EndTime, opt => opt.MapFrom(s => s.StartTime.AddHours(1))); // enforce 1-hour slot
        }
    }
}
