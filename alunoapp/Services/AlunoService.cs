using alunoapp.Exceptions;
using alunoapp.Models;
using alunoapp.Repositories;

namespace alunoapp.Services;

public class AlunoService : BaseService
{
    private readonly AlunoRepository _alunoRepository;

    public AlunoService(AlunoRepository alunoRepository)
    {
        _alunoRepository = alunoRepository;
    }

    public async Task<Guid> Cadastrar(Aluno aluno)
    {
        try
        {
            ValidarCampos(aluno, Guid.Empty);
            return await _alunoRepository.Cadastrar(aluno);
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao cadastrar aluno: {ex.Message}");
        }
    }

    public async Task<List<Aluno>> Obter()
    {
        try
        {
            return await _alunoRepository.Obter();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter aluno: {ex.Message}");
        }
    }

    public async Task<Aluno> Obter(Guid alunoId)
    {
        try
        {
            var aluno = await _alunoRepository.Obter(alunoId);
            if (aluno == null) throw new NotFoundException("Aluno não encontrado com o ID informado.");
            return aluno;
        }
        catch (NotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter aluno por ID: {ex.Message}");
        }
    }

    private void ValidarCampos(Aluno aluno, Guid alunoId)
    {
        ClearErrors();

        if (string.IsNullOrWhiteSpace(aluno.Nome))
            AddError(nameof(aluno.Nome), "Informe um nome.");

        if (string.IsNullOrWhiteSpace(aluno.Matricula))
            AddError(nameof(aluno.Matricula), "Informe uma matrícula.");

        if (aluno.TurmaId == Guid.Empty)
            AddError(nameof(aluno.TurmaId), "Informe uma turma.");

        if (Errors.Any())
            throw new ValidationException(Errors);
    }
}