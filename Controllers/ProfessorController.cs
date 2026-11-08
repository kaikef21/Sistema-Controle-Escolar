using alunoapp.Models;
using alunoapp.Services;
using alunoapp.Validations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace alunoapp.Controllers;

public static class ProfessorController
{
    public record ProfessorPostResponse(Guid professorId, string Mensagem);

    public static void MapProfessorEndpoints(this WebApplication app)
    {
        app.MapPost("v1/professor/", async (Professor professor, ProfessorService services) =>
        {
            Guid professorId = await services.Cadastrar(professor);
            return TypedResults.CreatedAtRoute(
                routeName: "professor_id",
                routeValues: new { professorId },
                value: new ProfessorPostResponse(professorId, "Professor cadastrado com sucesso"));
        })
        .WithTags("Professor")
        .WithSummary("cadastrar um professor")
        .WithDescription("Cadastra um professor com o nome e senha")
        .Produces<ProfessorPostResponse>(StatusCodes.Status201Created)
        .Produces<List<ValidationError>>(StatusCodes.Status400BadRequest)
        .Produces<string>(StatusCodes.Status500InternalServerError);

        app.MapGet("v1/professor/{professorId:guid}", async (ProfessorService services, Guid professorId) =>
        {
            var result = await services.Obter(professorId);
            return Results.Ok(result);
        })
        .WithName("professor_id")
        .WithTags("Professor")
        .WithSummary("Retorna o Professor por ID")
        .WithDescription("Retorna um professor especifico por ID")
        .Produces<List<Professor>>(StatusCodes.Status200OK)
        .Produces<string>(StatusCodes.Status404NotFound)
        .Produces<string>(StatusCodes.Status500InternalServerError);
    }
}




