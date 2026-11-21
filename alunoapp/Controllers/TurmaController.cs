using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;

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
                value: new TurmaPostResponse(turmaId, "Turma cadastrada com sucesso"));
        })
        .WithTags("Turma")
        .WithSummary("Cadastrar uma turma")
        .WithDescription("Cadastra uma turma com nome e ano letivo")
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
        .WithSummary("Retorna todas as turmas")
        .WithDescription("Retorna a lista de turmas cadastradas")
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
        .WithSummary("Retorna a turma por ID")
        .WithDescription("Retorna uma turma específica por ID")
        .Produces<Turma>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}