using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class ProfessorService : BaseService
{
    private readonly ProfessorRepository _professorRepository;

    public ProfessorService(ProfessorRepository professorRepository)
    {
        _professorRepository = professorRepository;
    }

    public async Task<Guid> Cadastrar(Professor professor)
    {
        try
        {
            ValidarCampos(professor, Guid.Empty);
            var professorId = await _professorRepository.Cadastrar(professor);
            return professorId;
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar professor: {ex.Message}");
        }
    }

    public async Task<List<Professor>> Obter()
    {
        try
        {
            return await _professorRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter professor: {ex.Message}");
        }
    }

    public async Task<Professor> Obter(Guid professorId)
    {
        try
        {
            var professor = await _professorRepository.Obter(professorId);
            if (professor == null) throw new NotFoundException("Professor não encontrado com o ID informado. ");
            return professor;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter professor por ID {ex.Message}");
        }
    }

    private void ValidarCampos(Professor professor, Guid professorId)
    {
        if (string.IsNullOrWhiteSpace(professor.Nome))
            AddError(nameof(professor.Nome), "Informe um nome.");

        if (string.IsNullOrWhiteSpace(professor.Email))
            AddError(nameof(professor.Email), "Informe um email .");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}