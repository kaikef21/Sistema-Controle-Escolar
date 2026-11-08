using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Utils;

namespace alunoapp.Controllers;

public static class DisciplinaController
{
    public record DisciplinaPostResponse(Guid disciplinaId, string Mensagem);

    public static void MapDisciplinaEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/disciplina/", async (Disciplina disciplina, DisciplinaService services) =>
        {
            Guid disciplinaId = await services.Cadastrar(disciplina);
            return TypedResults.CreatedAtRoute(
                routeName: "disciplina_id",
                routeValues: new { disciplinaId },
                value: new DisciplinaPostResponse(disciplinaId, "Disciplina cadastrada com sucesso"));
        })
        .WithTags("Disciplina")
        .WithSummary("Cadastrar uma disciplina")
        .WithDescription("Cadastra uma disciplina com nome e descrição")
        .Produces<DisciplinaPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/disciplina/", async (DisciplinaService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("disciplina_get_all")
        .WithTags("Disciplina")
        .WithSummary("Retorna todas as disciplinas")
        .WithDescription("Retorna a lista de disciplinas cadastradas")
        .Produces<List<Disciplina>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/disciplina/{disciplinaId:guid}", async (DisciplinaService services, Guid disciplinaId) =>
        {
            var result = await services.Obter(disciplinaId);
            return Results.Ok(result);
        })
        .WithName("disciplina_id")
        .WithTags("Disciplina")
        .WithSummary("Retorna a Disciplina por ID")
        .WithDescription("Retorna uma disciplina especifica por ID")
        .Produces<Disciplina>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}