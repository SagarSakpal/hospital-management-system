using System.Text;
using Hospital.Application.Common.Interfaces;
using Hospital.Application.Common.Settings;
using Hospital.Domain.Identity;
using Hospital.Infrastructure.Auth;
using Hospital.Infrastructure.Persistence;
using Hospital.Infrastructure.Seed;
using Hospital.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using IAuthService = Hospital.Application.Common.Interfaces.IAuthService;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AutoMapper;
using FluentValidation;
using FluentValidation.AspNetCore;
using Hospital.Application.Common.Interfaces.Persistence;
using Hospital.Application.Common.Mapping;
using Hospital.Application.Services;
using Hospital.Infrastructure.Persistence.Repositories;
using Hospital.Api.Middleware;
using Hospital.Infrastructure.Audit;
using Hospital.Infrastructure.Caching;
using Hospital.Infrastructure.Files;


var builder = WebApplication.CreateBuilder(args);

// 1) Configuration
var configuration = builder.Configuration;

// 2) DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// 3) Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 4) JWT settings + Authentication
builder.Services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
var jwt = configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();

// Disable inbound claim type mapping to keep claim types as we set them
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // set true in prod if HTTPS
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwt.Issuer,
        ValidAudience = jwt.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),

        // Tell ASP.NET Core which claim to treat as Name and Role
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role
    };
});

// 5) Authorization (policies optional now)
builder.Services.AddAuthorization();

// 6) DI: Application + Infrastructure services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 7) Controllers
builder.Services.AddControllers();

// 8) CORS (dev-open; restrict later)
builder.Services.AddCors(o =>
{
    o.AddPolicy("dev", p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// 9) Swagger + OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hospital Management API",
        Version = "v1",
        Description = "API for Hospital Management System with OAuth2 + JWT + RBAC"
    });

    // Add the Bearer Security Definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n " +
                      "Enter **only** your token below.\r\n\r\nExample: 12345abcdef",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    // Add the Security Requirement
    var securityRequirement = new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "bearer",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    };
    c.AddSecurityRequirement(securityRequirement);
});
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(typeof(MappingProfile).Assembly);


// Repositories & UoW
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
builder.Services.AddScoped<IDoctorPatientRepository, DoctorPatientRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IDoctorPatientService, DoctorPatientService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IFileStorage, LocalFileStorage>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
builder.Services.AddScoped<ISearchService, SearchService>();

builder.Services.Configure<CacheSettings>(builder.Configuration.GetSection("CacheSettings"));
builder.Services.AddMemoryCache();

builder.Services.AddScoped<IAppCache, MemoryAppCache>();
builder.Services.AddScoped<ILookupService, LookupService>();



var app = builder.Build();

// 10) Migrate & Seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();

    var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
    await IdentitySeeder.SeedAsync(userMgr, roleMgr);

    // Seed specializations and patients
    await SpecializationSeeder.SeedAsync(db);
    await PatientSeeder.SeedAsync(db);
}

// 11) Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hospital Management API v1");
    });
}




// Exception middleware (must be early)
app.UseExceptionMiddleware();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseCors("dev");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
