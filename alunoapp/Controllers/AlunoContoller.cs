using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Utils;

namespace alunoapp.Controllers;

public static class AlunoController
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
        .WithSummary("Cadastrar um aluno")
        .WithDescription("Cadastra um aluno com username, senha, nome e perfil")
        .Produces<AlunoPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get ]
        app.MapGet("v1/aluno/", async (AlunoService services) =>
        {
            var result = await services.Obter();
            return Results.Ok(result);
        })
        .WithName("aluno_get_all")
        .WithTags("Aluno")
        .WithSummary("Retorna todos os alunos")
        .WithDescription("Retorna a lista de alunos cadastrados")
        .Produces<List<Aluno>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion

        #region [ get by id ]
        app.MapGet("v1/aluno/{alunoId:guid}", async (AlunoService services, Guid alunoId) =>
        {
            var result = await services.Obter(alunoId);
            return Results.Ok(result);
        })
        .WithName("aluno_id")
        .WithTags("Aluno")
        .WithSummary("Retorna o Aluno por ID")
        .WithDescription("Retorna um aluno especifico por ID")
        .Produces<Aluno>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
        #endregion
    }
}