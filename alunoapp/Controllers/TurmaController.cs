using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Utils;

namespace alunoapp.Controllers;

public static class TurmaController
{
    public record TurmaPostResponse(Guid turmaId, string Mensagem);

    public static void MapTurmaEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/turma/", async (Turma turma, TurmaService services) =>
        {
            Guid turmaId = await services.Cadastrar(turma);
            return TypedResults.CreatedAtRoute(
                routeName: "turma_id",
                routeValues: new { turmaId },
                value: new TurmaPostResponse(turmaId, "Turma cadastrado com sucesso"));
        })
        .WithTags("Turma")
        .WithSummary("Cadastrar um turma")
        .WithDescription("Cadastra um turma com username, senha, nome e perfil")
        .Produces<TurmaPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/turma/", async (TurmaService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("turma_get_all")
        .WithTags("Turma")
        .WithSummary("Retorna todos os turmas")
        .WithDescription("Retorna a lista de turmas cadastrados")
        .Produces<List<Turma>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/turma/{turmaId:guid}", async (TurmaService services, Guid turmaId) =>
        {
            var result = await services.Obter(turmaId);
            return Results.Ok(result);
        })
        .WithName("turma_id")
        .WithTags("Turma")
        .WithSummary("Retorna o Turma por ID")
        .WithDescription("Retorna um turma especifico por ID")
        .Produces<Turma>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}