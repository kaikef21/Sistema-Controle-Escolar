using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace alunoapp.Startup;

public static class JwtMiddlewareConfiguration
{
    public static WebApplication UseJwtValidation(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            var path = context.Request.Path;

            if (RotaPublica(context, path))
            {
                await next();
                return;
            }

            var authHeader = context.Request.Headers.Authorization
                .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(authHeader) ||
                !authHeader.StartsWith(
                    "Bearer ",
                    StringComparison.OrdinalIgnoreCase))
            {
                await RetornarNaoAutorizado(
                    context,
                    "Não autorizado.");
                return;
            }

            var token = authHeader["Bearer ".Length..].Trim();

            try
            {
                ValidarToken(context, token);
            }
            catch (SecurityTokenExpiredException)
            {
                await RetornarNaoAutorizado(
                    context,
                    "Não autorizado. Token expirado.");
                return;
            }
            catch (SecurityTokenException)
            {
                await RetornarNaoAutorizado(
                    context,
                    "Não autorizado. Token inválido.");
                return;
            }
            catch (Exception)
            {
                await RetornarNaoAutorizado(
                    context,
                    "Não autorizado.");
                return;
            }

            await next();

            if (context.Response.StatusCode ==
                    StatusCodes.Status403Forbidden &&
                !context.Response.HasStarted)
            {
                await context.Response.WriteAsync(
                    "Acesso negado.");
            }
        });

        return app;
    }

    private static bool RotaPublica(
        HttpContext context,
        PathString path)
    {
        return
            path.StartsWithSegments("/v1/auth") ||
            path.StartsWithSegments("/swagger") ||
            path.StartsWithSegments("/health") ||
            (
                path.StartsWithSegments(
                    "/v1/unidades-organizacionais") &&
                (
                    context.Request.Method == HttpMethods.Get ||
                    context.Request.Method == HttpMethods.Post
                )
            ) ||
            (
                path.StartsWithSegments("/v1/usuarios") &&
                context.Request.Method == HttpMethods.Post
            );
    }

    private static void ValidarToken(
        HttpContext context,
        string token)
    {
        var jwtSecret = Environment.GetEnvironmentVariable(
            "zenite_jwt_auth");

        if (string.IsNullOrWhiteSpace(jwtSecret))
        {
            throw new InvalidOperationException(
                "A variável de ambiente zenite_jwt_auth " +
                "não foi encontrada ou configurada.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(jwtSecret);

        tokenHandler.ValidateToken(
            token,
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey =
                    new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            },
            out var validatedToken);

        var jwtToken = (JwtSecurityToken)validatedToken;

        var claimsIdentity = new ClaimsIdentity(
            jwtToken.Claims,
            authenticationType: "Bearer",
            nameType: "unique_name",
            roleType: "role");

        context.User =
            new ClaimsPrincipal(claimsIdentity);
    }

    private static async Task RetornarNaoAutorizado(
        HttpContext context,
        string mensagem)
    {
        if (context.Response.HasStarted)
            return;

        context.Response.StatusCode =
            StatusCodes.Status401Unauthorized;

        await context.Response.WriteAsync(mensagem);
    }
}