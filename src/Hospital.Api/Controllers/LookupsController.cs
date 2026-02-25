using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Hospital.Application.DTO.Lookups;
using Hospital.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/v1/lookups")]
    public class LookupsController : ControllerBase
    {
        private readonly ILookupService _lookups;

        public LookupsController(ILookupService lookups)
        {
            _lookups = lookups;
        }

        // Everyone authenticated can consume lookups (tune if needed)
        [HttpGet("specializations")]
        [Authorize]
        [ProducesResponseType(typeof(List<SpecializationDto>), StatusCodes.Status200OK)]
        public Task<List<SpecializationDto>> Specializations(CancellationToken ct)
            => _lookups.GetSpecializationsAsync(ct);

        [HttpGet("doctors-lite")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        [ProducesResponseType(typeof(List<DoctorLiteDto>), StatusCodes.Status200OK)]
        public Task<List<DoctorLiteDto>> DoctorsLite(CancellationToken ct)
            => _lookups.GetDoctorsLiteAsync(ct);
    }
}
