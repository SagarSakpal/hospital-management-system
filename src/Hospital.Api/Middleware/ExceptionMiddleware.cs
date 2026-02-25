using System.Net;
using Hospital.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace Hospital.Api.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ve)
            {
                await WriteProblem(context, StatusCodes.Status400BadRequest, ve.Message, ve.Errors);
            }
            catch (NotFoundException nfe)
            {
                await WriteProblem(context, StatusCodes.Status404NotFound, nfe.Message);
            }
            catch (ConflictException ce)
            {
                await WriteProblem(context, StatusCodes.Status409Conflict, ce.Message);
            }
            catch (BusinessRuleException be)
            {
                await WriteProblem(context, StatusCodes.Status400BadRequest, be.Message);
            }
            catch (UnauthorizedAccessException uae)
            {
                _logger.LogWarning(uae, "Unauthorized access attempt");
                await WriteProblem(context, StatusCodes.Status401Unauthorized, uae.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception: {Message}. StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
                await WriteProblem(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        private static async Task WriteProblem(HttpContext context, int status, string detail, object? errors = null)
        {
            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = status;

            var problem = new ProblemDetails
            {
                Status = status,
                Title = ReasonPhrases.GetReasonPhrase(status),
                Detail = detail,
                Instance = context.Request.Path
            };

            if (errors != null)
            {
                problem.Extensions["errors"] = errors;
            }

            await context.Response.WriteAsJsonAsync(problem);
        }
    }

    public static class ExceptionMiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
            => app.UseMiddleware<ExceptionMiddleware>();
    }
}
