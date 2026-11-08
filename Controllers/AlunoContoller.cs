using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace alunoapp.Controllers;

public static class AlunoContoller
{
    public record AlunoPostResponse(Guid alunoId, string Mensagem);

    public static void MapAlunoEndpoints(this WebApplication app)
    {
        #region [ post ]
        app.MapPost("v1/aluno/", async (Aluno aluno, AlunoService services) =>
        {
            Guid alunoId = await services.Cadastrar(aluno);
            return TypedResults.CreatedAtRoute(
                routeName: "aluno_id",
                routeValues: new { alunoId },
                value: new AlunoPostResponse(alunoId, "Aluno cadastrado com sucesso"));
        })
        .WithTags("Aluno")
        .WithSummary("cadastrar um aluno")
        .WithDescription("Cadastra um aluno com o nome e senha")
        .Produces<AlunoPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/aluno/{alunoId:guid}", async (AlunoService services, Guid alunoId) =>
        {
            var result = await services.Obter(alunoId);
            return Results.Ok(result);
        })
            .WithName("aluno_id")
            .WithTags("Aluno")
            .WithSummary("Retorna o Aluno por ID")
            .WithDescription("Retorna um aluno especifico por ID")
            .Produces<List<Aluno>>(StatusCodes.Status200OK)
            .Produces<string>(StatusCodes.Status404NotFound)
            .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}