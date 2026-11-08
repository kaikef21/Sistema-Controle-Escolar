using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace alunoapp.Controllers;

public static class UsuarioController
{
    public record UsuarioPostResponse(Guid usuarioId, string Mensagem);

    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/usuario/", async (Usuario usuario, UsuarioService services) =>
        {
            Guid usuarioId = await services.Cadastrar(usuario);
            return TypedResults.CreatedAtRoute(
                routeName: "usuario_id",
                routeValues: new { usuarioId },
                value: new UsuarioPostResponse(usuarioId, "Usuario cadastrado com sucesso"));
        })
        .WithTags("Usuario")
        .WithSummary("Cadastrar um usuario")
        .WithDescription("Cadastra um usuario com username, senha, nome e perfil")
        .Produces<UsuarioPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/usuario/", async (UsuarioService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("usuario_get_all")
        .WithTags("Usuario")
        .WithSummary("Retorna todos os usuarios")
        .WithDescription("Retorna a lista de usuarios cadastrados")
        .Produces<List<Usuario>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/usuario/{usuarioId:guid}", async (UsuarioService services, Guid usuarioId) =>
        {
            var result = await services.Obter(usuarioId);
            return Results.Ok(result);
        })
        .WithName("usuario_id")
        .WithTags("Usuario")
        .WithSummary("Retorna o Usuario por ID")
        .WithDescription("Retorna um usuario especifico por ID")
        .Produces<Usuario>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}