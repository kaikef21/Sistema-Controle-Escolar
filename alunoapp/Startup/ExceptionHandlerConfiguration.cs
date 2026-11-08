using alunoapp.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace alunoapp.Startup;

public static class ExceptionHandlerConfiguration
{
    public static WebApplication UseCustomExceptionHandlerConfiguration(this WebApplication app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var exception = context.Features
                    .Get<IExceptionHandlerFeature>()?
                    .Error;

                if (exception is ValidationException validationException)
                {
                    context.Response.StatusCode =
                        StatusCodes.Status400BadRequest;

                    await context.Response.WriteAsJsonAsync(
                        validationException.Errors);

                    return;
                }

                if (exception is NotFoundException notFoundException)
                {
                    context.Response.StatusCode =
                        StatusCodes.Status404NotFound;

                    await context.Response.WriteAsync(
                        notFoundException.Message);

                    return;
                }

                if (exception is InvalidOperationException invalidOperationException)
                {
                    context.Response.StatusCode =
                        StatusCodes.Status400BadRequest;

                    await context.Response.WriteAsync(
                        invalidOperationException.Message);

                    return;
                }

                if (exception is ForbiddenException forbiddenException)
                {
                    context.Response.StatusCode =
                        StatusCodes.Status403Forbidden;

                    await context.Response.WriteAsync(
                        forbiddenException.Message);

                    return;
                }

                if (exception is UnauthorizedAccessException unauthorizedException)
                {
                    context.Response.StatusCode =
                        StatusCodes.Status401Unauthorized;

                    await context.Response.WriteAsync(
                        unauthorizedException.Message);

                    return;
                }

                context.Response.StatusCode =
                    StatusCodes.Status500InternalServerError;

                await context.Response.WriteAsync(
                    exception?.Message ?? "Erro não identificado.");
            });
        });

        return app;
    }
}