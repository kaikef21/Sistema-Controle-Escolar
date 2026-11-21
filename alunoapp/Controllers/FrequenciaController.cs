using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;

namespace alunoapp.Controllers;

public static class FrequenciaController
{
    public record FrequenciaPostResponse(Guid frequenciaId, string Mensagem);

    public static void MapFrequenciaEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/frequencia/", async (Frequencia frequencia, FrequenciaService services) =>
        {
            Guid frequenciaId = await services.Cadastrar(frequencia);
            return TypedResults.CreatedAtRoute(
                routeName: "frequencia_id",
                routeValues: new { frequenciaId },
                value: new FrequenciaPostResponse(frequenciaId, "Frequência cadastrada com sucesso"));
        })
        .WithTags("Frequencia")
        .WithSummary("Cadastrar uma frequência")
        .WithDescription("Registra presença ou falta de um aluno em uma data de aula")
        .Produces<FrequenciaPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/frequencia/", async (FrequenciaService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("frequencia_get_all")
        .WithTags("Frequencia")
        .WithSummary("Retorna todas as frequências")
        .WithDescription("Retorna a lista de frequências cadastradas")
        .Produces<List<Frequencia>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/frequencia/{frequenciaId:guid}", async (FrequenciaService services, Guid frequenciaId) =>
        {
            var result = await services.Obter(frequenciaId);
            return Results.Ok(result);
        })
        .WithName("frequencia_id")
        .WithTags("Frequencia")
        .WithSummary("Retorna a frequência por ID")
        .WithDescription("Retorna uma frequência específica por ID")
        .Produces<Frequencia>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}