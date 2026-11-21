using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;

namespace alunoapp.Controllers;

public static class AtividadeController
{
    public record AtividadePostResponse(Guid atividadeId, string Mensagem);

    public static void MapAtividadeEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/atividade/", async (Atividade atividade, AtividadeService services) =>
        {
            Guid atividadeId = await services.Cadastrar(atividade);
            return TypedResults.CreatedAtRoute(
                routeName: "atividade_id",
                routeValues: new { atividadeId },
                value: new AtividadePostResponse(atividadeId, "Atividade cadastrada com sucesso"));
        })
        .WithTags("Atividade")
        .WithSummary("Cadastrar uma atividade")
        .WithDescription("Cadastra uma atividade com título, tipo, nota máxima, turma e data de realização")
        .Produces<AtividadePostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/atividade/", async (AtividadeService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("atividade_get_all")
        .WithTags("Atividade")
        .WithSummary("Retorna todas as atividades")
        .WithDescription("Retorna a lista de atividades cadastradas")
        .Produces<List<Atividade>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/atividade/{atividadeId:guid}", async (AtividadeService services, Guid atividadeId) =>
        {
            var result = await services.Obter(atividadeId);
            return Results.Ok(result);
        })
        .WithName("atividade_id")
        .WithTags("Atividade")
        .WithSummary("Retorna a atividade por ID")
        .WithDescription("Retorna uma atividade específica por ID")
        .Produces<Atividade>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}