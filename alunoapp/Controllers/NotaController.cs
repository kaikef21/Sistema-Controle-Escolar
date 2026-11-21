using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;

namespace alunoapp.Controllers;

public static class NotaController
{
    public record NotaPostResponse(Guid notaId, string Mensagem);

    public static void MapNotaEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/nota/", async (Nota nota, NotaService services) =>
        {
            Guid notaId = await services.Cadastrar(nota);
            return TypedResults.CreatedAtRoute(
                routeName: "nota_id",
                routeValues: new { notaId },
                value: new NotaPostResponse(notaId, "Nota cadastrada com sucesso"));
        })
        .WithTags("Nota")
        .WithSummary("Cadastrar uma nota")
        .WithDescription("Cadastra uma nota vinculada a um aluno e uma atividade")
        .Produces<NotaPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/nota/", async (NotaService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("nota_get_all")
        .WithTags("Nota")
        .WithSummary("Retorna todas as notas")
        .WithDescription("Retorna a lista de notas cadastradas")
        .Produces<List<Nota>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/nota/{notaId:guid}", async (NotaService services, Guid notaId) =>
        {
            var result = await services.Obter(notaId);
            return Results.Ok(result);
        })
        .WithName("nota_id")
        .WithTags("Nota")
        .WithSummary("Retorna a nota por ID")
        .WithDescription("Retorna uma nota específica por ID")
        .Produces<Nota>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}